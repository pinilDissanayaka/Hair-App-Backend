import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TryOnSession, ProcessingStatus } from './entities/tryon-session.entity';
import { Hairstyle } from './entities/hairstyle.entity';
import { CustomerProfile, SubscriptionTier } from '../users/entities/customer-profile.entity';
import { CreateTryOnDto } from './dto/create-tryon.dto';

@Injectable()
export class AiTryonService {
    constructor(
        @InjectRepository(TryOnSession)
        private readonly tryonRepository: Repository<TryOnSession>,
        @InjectRepository(Hairstyle)
        private readonly hairstyleRepository: Repository<Hairstyle>,
        @InjectRepository(CustomerProfile)
        private readonly customerProfileRepository: Repository<CustomerProfile>,
    ) {}

    async create(createTryOnDto: CreateTryOnDto, userId: number): Promise<TryOnSession> {
        // Check user credits/subscription
        const profile = await this.customerProfileRepository.findOne({
            where: { userId },
        });

        if (!profile) {
            throw new NotFoundException('Customer profile not found');
        }

        // Check if user has credits available
        const hasCredits = await this.checkAndConsumeCredits(profile);
        if (!hasCredits) {
            throw new BadRequestException('Insufficient try-on credits');
        }

        // Get hairstyle details
        const hairstyle = await this.hairstyleRepository.findOne({
            where: { id: createTryOnDto.hairstyleId },
        });

        if (!hairstyle) {
            throw new NotFoundException('Hairstyle not found');
        }

        // Check if hairstyle is premium and user has access
        if (hairstyle.isPremium && profile.subscriptionTier === SubscriptionTier.FREE) {
            throw new BadRequestException('This hairstyle is only available for premium users');
        }

        // Create try-on session
        const session = this.tryonRepository.create({
            ...createTryOnDto,
            userId,
            hairstyleName: hairstyle.name,
            status: ProcessingStatus.PENDING,
        });

        const savedSession = await this.tryonRepository.save(session);

        // Process asynchronously
        this.processWithGemini(savedSession.id, createTryOnDto.originalImageUrl, hairstyle.imageUrl);

        return savedSession;
    }

    async findAll(userId: number): Promise<TryOnSession[]> {
        return await this.tryonRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<TryOnSession> {
        const session = await this.tryonRepository.findOne({
            where: { id },
        });

        if (!session) {
            throw new NotFoundException('Try-on session not found');
        }

        return session;
    }

    async save(id: number, userId: number): Promise<TryOnSession> {
        const session = await this.findOne(id);

        if (session.userId !== userId) {
            throw new BadRequestException('Not authorized');
        }

        session.isSaved = true;
        return await this.tryonRepository.save(session);
    }

    async share(id: number): Promise<{ shareToken: string; shareUrl: string }> {
        const session = await this.findOne(id);

        if (!session.shareToken) {
            session.shareToken = this.generateShareToken();
            session.isShared = true;
            await this.tryonRepository.save(session);
        }

        return {
            shareToken: session.shareToken,
            shareUrl: `${process.env.APP_URL}/shared/tryon/${session.shareToken}`,
        };
    }

    async findByShareToken(shareToken: string): Promise<TryOnSession> {
        const session = await this.tryonRepository.findOne({
            where: { shareToken },
        });

        if (!session) {
            throw new NotFoundException('Shared try-on not found');
        }

        // Increment view count
        session.viewCount += 1;
        await this.tryonRepository.save(session);

        return session;
    }

    async getAllHairstyles(filters?: {
        category?: string;
        gender?: string;
        isPremium?: boolean;
    }): Promise<Hairstyle[]> {
        const query = this.hairstyleRepository.createQueryBuilder('hairstyle');

        query.where('hairstyle.isActive = :isActive', { isActive: true });

        if (filters?.category) {
            query.andWhere('hairstyle.category = :category', { category: filters.category });
        }

        if (filters?.gender) {
            query.andWhere('hairstyle.gender = :gender', { gender: filters.gender });
        }

        if (filters?.isPremium !== undefined) {
            query.andWhere('hairstyle.isPremium = :isPremium', { isPremium: filters.isPremium });
        }

        query.orderBy('hairstyle.isFeatured', 'DESC');
        query.addOrderBy('hairstyle.tryOnCount', 'DESC');
        query.addOrderBy('hairstyle.sortOrder', 'ASC');

        return await query.getMany();
    }

    private async checkAndConsumeCredits(profile: CustomerProfile): Promise<boolean> {
        const now = new Date();

        // For FREE tier - check weekly limit
        if (profile.subscriptionTier === SubscriptionTier.FREE) {
            if (!profile.weeklyResetDate || profile.weeklyResetDate < now) {
                // Reset weekly counter
                profile.weeklyTryOnsUsed = 0;
                profile.weeklyResetDate = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
            }

            if (profile.weeklyTryOnsUsed >= 5) {
                return false; // Weekly limit reached
            }

            profile.weeklyTryOnsUsed += 1;
        } else {
            // For PLUS/PRO tiers - use credits
            if (profile.tryOnCredits <= 0) {
                return false;
            }

            profile.tryOnCredits -= 1;
        }

        await this.customerProfileRepository.save(profile);
        return true;
    }

    private async processWithGemini(sessionId: number, userImage: string, hairstyleImage: string): Promise<void> {
        try {
            const startTime = Date.now();

            // Update status to processing
            await this.tryonRepository.update(sessionId, {
                status: ProcessingStatus.PROCESSING,
            });

            // TODO: Integrate with Gemini 2.5 Flash API
            // This is a placeholder - you'll need to implement actual Gemini API integration
            // Example:
            // const result = await geminiClient.generateImage({
            //     userImage,
            //     hairstyleImage,
            //     model: 'gemini-2.5-flash',
            // });

            // Simulated result for now
            const resultImageUrl = 'https://placeholder-result-image.com/result.jpg';

            const processingTime = Date.now() - startTime;

            // Update session with result
            await this.tryonRepository.update(sessionId, {
                status: ProcessingStatus.COMPLETED,
                resultImageUrl,
                processingTimeMs: processingTime,
                geminiMetadata: {
                    model: 'gemini-2.5-flash',
                    cost: 0.039, // USD
                    batchProcessed: false,
                },
            });

            // Increment hairstyle try-on count
            const session = await this.tryonRepository.findOne({ where: { id: sessionId } });
            if (session?.hairstyleId) {
                await this.hairstyleRepository.increment(
                    { id: session.hairstyleId },
                    'tryOnCount',
                    1,
                );
            }
        } catch (error) {
            // Update session with error
            await this.tryonRepository.update(sessionId, {
                status: ProcessingStatus.FAILED,
                errorMessage: error.message,
            });
        }
    }

    private generateShareToken(): string {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}
