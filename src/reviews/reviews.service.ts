import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';

@Injectable()
export class ReviewsService {
    constructor(
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
    ) {}

    async create(createReviewDto: CreateReviewDto, customerId: number): Promise<Review> {
        // Check if user already reviewed this booking
        if (createReviewDto.bookingId) {
            const existing = await this.reviewRepository.findOne({
                where: {
                    bookingId: createReviewDto.bookingId,
                    customerId,
                },
            });

            if (existing) {
                throw new BadRequestException('You have already reviewed this booking');
            }
        }

        const review = this.reviewRepository.create({
            ...createReviewDto,
            customerId,
        });

        const savedReview = await this.reviewRepository.save(review);

        // TODO: Update salon rating (call salon service)

        return savedReview;
    }

    async findBySalon(salonId: number): Promise<Review[]> {
        return await this.reviewRepository.find({
            where: { salonId, isVisible: true },
            relations: ['customer'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Review> {
        const review = await this.reviewRepository.findOne({
            where: { id },
            relations: ['customer', 'salon'],
        });

        if (!review) {
            throw new NotFoundException('Review not found');
        }

        return review;
    }

    async addSalonResponse(reviewId: number, response: string): Promise<Review> {
        const review = await this.findOne(reviewId);
        review.salonResponse = response;
        review.salonResponseDate = new Date();
        return await this.reviewRepository.save(review);
    }

    async markHelpful(reviewId: number): Promise<Review> {
        const review = await this.findOne(reviewId);
        review.helpfulCount += 1;
        return await this.reviewRepository.save(review);
    }
}
