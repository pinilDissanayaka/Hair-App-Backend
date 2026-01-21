import { Controller, Get, Post, Body, Param, Query, UseGuards, Request, Patch } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AiTryonService } from './ai-tryon.service';
import { CreateTryOnDto } from './dto/create-tryon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('AI Try-on')
@Controller('ai-tryon')
export class AiTryonController {
    constructor(private readonly aiTryonService: AiTryonService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Create AI hairstyle try-on',
        description: `
            Generate AI hairstyle transformation using Gemini 2.5 Flash.
            - FREE: 5 try-ons per week
            - PLUS: 80 try-ons per month
            - PRO: 250 try-ons per month
            Automatically deducts credits from user account.
        `
    })
    @ApiResponse({ status: 201, description: 'Try-on session created and processing started' })
    @ApiResponse({ status: 400, description: 'Insufficient credits or invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Hairstyle not found' })
    create(@Body() createTryOnDto: CreateTryOnDto, @Request() req) {
        return this.aiTryonService.create(createTryOnDto, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-sessions')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get my try-on sessions',
        description: 'Retrieve all AI try-on sessions for authenticated user'
    })
    @ApiResponse({ status: 200, description: 'Sessions retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    findAll(@Request() req) {
        return this.aiTryonService.findAll(req.user.id);
    }

    @Get('hairstyles')
    @ApiOperation({
        summary: 'Get all hairstyles',
        description: 'Browse available hairstyles from the catalog. Supports filtering by category, gender, and premium status.'
    })
    @ApiQuery({ name: 'category', required: false, description: 'Filter by category (short, medium, long, etc.)' })
    @ApiQuery({ name: 'gender', required: false, description: 'Filter by gender (male, female, unisex)' })
    @ApiQuery({ name: 'isPremium', required: false, description: 'Filter by premium status (true/false)' })
    @ApiResponse({ status: 200, description: 'Hairstyles retrieved successfully' })
    getAllHairstyles(
        @Query('category') category?: string,
        @Query('gender') gender?: string,
        @Query('isPremium') isPremium?: string,
    ) {
        return this.aiTryonService.getAllHairstyles({
            category,
            gender,
            isPremium: isPremium ? isPremium === 'true' : undefined,
        });
    }

    @Get('shared/:shareToken')
    @ApiOperation({
        summary: 'View shared try-on',
        description: 'View a publicly shared hairstyle try-on result using share token'
    })
    @ApiParam({ name: 'shareToken', description: 'Share token from sharing a try-on' })
    @ApiResponse({ status: 200, description: 'Shared try-on retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Shared try-on not found' })
    findByShareToken(@Param('shareToken') shareToken: string) {
        return this.aiTryonService.findByShareToken(shareToken);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get try-on session by ID', description: 'Retrieve try-on session details and result' })
    @ApiParam({ name: 'id', description: 'Try-on session ID' })
    @ApiResponse({ status: 200, description: 'Session retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Session not found' })
    findOne(@Param('id') id: string) {
        return this.aiTryonService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/save')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Save try-on result',
        description: 'Mark a try-on result as saved to favorites'
    })
    @ApiParam({ name: 'id', description: 'Try-on session ID' })
    @ApiResponse({ status: 200, description: 'Try-on saved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Session not found' })
    save(@Param('id') id: string, @Request() req) {
        return this.aiTryonService.save(+id, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post(':id/share')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Share try-on result',
        description: 'Generate a shareable link for a try-on result'
    })
    @ApiParam({ name: 'id', description: 'Try-on session ID' })
    @ApiResponse({
        status: 200,
        description: 'Share link generated',
        schema: {
            example: {
                shareToken: 'abc123xyz',
                shareUrl: 'https://app.com/shared/tryon/abc123xyz'
            }
        }
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Session not found' })
    share(@Param('id') id: string) {
        return this.aiTryonService.share(+id);
    }
}
