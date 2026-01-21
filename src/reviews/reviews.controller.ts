import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Create a review',
        description: 'Submit a review for a salon. Can include ratings, comments, and before/after photos. One review per booking.'
    })
    @ApiResponse({ status: 201, description: 'Review created successfully' })
    @ApiResponse({ status: 400, description: 'Already reviewed this booking' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createReviewDto: CreateReviewDto, @Request() req) {
        return this.reviewsService.create(createReviewDto, req.user.id);
    }

    @Get('salon/:salonId')
    @ApiOperation({
        summary: 'Get salon reviews',
        description: 'Retrieve all visible reviews for a specific salon, ordered by most recent first'
    })
    @ApiParam({ name: 'salonId', description: 'Salon ID' })
    @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
    findBySalon(@Param('salonId') salonId: string) {
        return this.reviewsService.findBySalon(+salonId);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get review by ID', description: 'Retrieve detailed review information' })
    @ApiParam({ name: 'id', description: 'Review ID' })
    @ApiResponse({ status: 200, description: 'Review retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    findOne(@Param('id') id: string) {
        return this.reviewsService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/respond')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Add salon response to review',
        description: 'Salon owners can respond to customer reviews'
    })
    @ApiParam({ name: 'id', description: 'Review ID' })
    @ApiResponse({ status: 200, description: 'Response added successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    addResponse(@Param('id') id: string, @Body('response') response: string) {
        return this.reviewsService.addSalonResponse(+id, response);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/helpful')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Mark review as helpful',
        description: 'Increment the helpful count for a review'
    })
    @ApiParam({ name: 'id', description: 'Review ID' })
    @ApiResponse({ status: 200, description: 'Review marked as helpful' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Review not found' })
    markHelpful(@Param('id') id: string) {
        return this.reviewsService.markHelpful(+id);
    }
}
