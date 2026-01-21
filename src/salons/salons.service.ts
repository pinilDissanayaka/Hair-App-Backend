import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between } from 'typeorm';
import { Salon, SalonGenderSpecialization, VerificationStatus } from './entities/salon.entity';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';

@Injectable()
export class SalonsService {
    constructor(
        @InjectRepository(Salon)
        private readonly salonRepository: Repository<Salon>,
    ) {}

    async create(createSalonDto: CreateSalonDto, ownerId: number): Promise<Salon> {
        // Check if owner already has a salon
        const existing = await this.salonRepository.findOne({ where: { ownerId } });
        if (existing) {
            throw new BadRequestException('User already owns a salon');
        }

        // Generate unique slug
        const slug = this.generateSlug(createSalonDto.businessName);

        const salon = this.salonRepository.create({
            ...createSalonDto,
            slug,
            ownerId,
            verificationStatus: VerificationStatus.PENDING,
        });

        return await this.salonRepository.save(salon);
    }

    async findAll(filters?: {
        city?: string;
        genderSpecialization?: SalonGenderSpecialization;
        minRating?: number;
        search?: string;
        isActive?: boolean;
    }): Promise<Salon[]> {
        const query = this.salonRepository.createQueryBuilder('salon');

        if (filters?.city) {
            query.andWhere('salon.city = :city', { city: filters.city });
        }

        if (filters?.genderSpecialization) {
            query.andWhere('salon.genderSpecialization = :gender', {
                gender: filters.genderSpecialization,
            });
        }

        if (filters?.minRating) {
            query.andWhere('salon.averageRating >= :rating', {
                rating: filters.minRating,
            });
        }

        if (filters?.search) {
            query.andWhere('(salon.businessName LIKE :search OR salon.description LIKE :search)', {
                search: `%${filters.search}%`,
            });
        }

        if (filters?.isActive !== undefined) {
            query.andWhere('salon.isActive = :isActive', { isActive: filters.isActive });
        }

        query.andWhere('salon.verificationStatus = :status', {
            status: VerificationStatus.VERIFIED,
        });

        query.leftJoinAndSelect('salon.services', 'services');
        query.orderBy('salon.averageRating', 'DESC');
        query.addOrderBy('salon.totalReviews', 'DESC');

        return await query.getMany();
    }

    async findOne(id: number): Promise<Salon> {
        const salon = await this.salonRepository.findOne({
            where: { id },
            relations: ['services', 'staff'],
        });

        if (!salon) {
            throw new NotFoundException('Salon not found');
        }

        // Increment view count
        await this.salonRepository.update(id, {
            viewCount: salon.viewCount + 1,
        });

        return salon;
    }

    async findBySlug(slug: string): Promise<Salon> {
        const salon = await this.salonRepository.findOne({
            where: { slug },
            relations: ['services', 'staff'],
        });

        if (!salon) {
            throw new NotFoundException('Salon not found');
        }

        return salon;
    }

    async findByOwner(ownerId: number): Promise<Salon> {
        const salon = await this.salonRepository.findOne({
            where: { ownerId },
            relations: ['services', 'staff'],
        });

        if (!salon) {
            throw new NotFoundException('Salon not found');
        }

        return salon;
    }

    async update(id: number, updateSalonDto: UpdateSalonDto, userId: number): Promise<Salon> {
        const salon = await this.findOne(id);

        // Check ownership
        if (salon.ownerId !== userId) {
            throw new ForbiddenException('You do not have permission to update this salon');
        }

        // Update slug if business name changed
        if (updateSalonDto.businessName && updateSalonDto.businessName !== salon.businessName) {
            updateSalonDto['slug'] = this.generateSlug(updateSalonDto.businessName);
        }

        await this.salonRepository.update(id, updateSalonDto);
        return await this.findOne(id);
    }

    async remove(id: number, userId: number): Promise<void> {
        const salon = await this.findOne(id);

        // Check ownership
        if (salon.ownerId !== userId) {
            throw new ForbiddenException('You do not have permission to delete this salon');
        }

        await this.salonRepository.delete(id);
    }

    async updateRating(salonId: number): Promise<void> {
        // This will be called when a new review is added
        const result = await this.salonRepository
            .createQueryBuilder('salon')
            .leftJoin('reviews', 'review', 'review.salonId = salon.id')
            .select('AVG(review.rating)', 'avgRating')
            .addSelect('COUNT(review.id)', 'totalReviews')
            .where('salon.id = :salonId', { salonId })
            .getRawOne();

        await this.salonRepository.update(salonId, {
            averageRating: result.avgRating || 0,
            totalReviews: result.totalReviews || 0,
        });
    }

    async searchNearby(latitude: number, longitude: number, radiusKm: number = 10): Promise<Salon[]> {
        // Haversine formula for nearby search
        const salons = await this.salonRepository
            .createQueryBuilder('salon')
            .where('salon.latitude IS NOT NULL AND salon.longitude IS NOT NULL')
            .andWhere('salon.verificationStatus = :status', { status: VerificationStatus.VERIFIED })
            .andWhere('salon.isActive = :isActive', { isActive: true })
            .getMany();

        // Filter by distance (simplified version)
        return salons.filter((salon) => {
            if (!salon.latitude || !salon.longitude) return false;
            const distance = this.calculateDistance(
                latitude,
                longitude,
                salon.latitude,
                salon.longitude,
            );
            return distance <= radiusKm;
        });
    }

    private generateSlug(businessName: string): string {
        const slug = businessName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');

        // Add random suffix to ensure uniqueness
        const randomSuffix = Math.random().toString(36).substring(2, 8);
        return `${slug}-${randomSuffix}`;
    }

    private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
        const R = 6371; // Earth's radius in km
        const dLat = this.toRadians(lat2 - lat1);
        const dLon = this.toRadians(lon2 - lon1);
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.toRadians(lat1)) *
                Math.cos(this.toRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private toRadians(degrees: number): number {
        return degrees * (Math.PI / 180);
    }
}
