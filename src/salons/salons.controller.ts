import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { SalonsService } from './salons.service';
import { CreateSalonDto } from './dto/create-salon.dto';
import { UpdateSalonDto } from './dto/update-salon.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SalonGenderSpecialization } from './entities/salon.entity';

@ApiTags('Salons')
@Controller('salons')
export class SalonsController {
    constructor(private readonly salonsService: SalonsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Register a new salon',
        description: 'Create a new salon listing. Requires authentication. One salon per user.'
    })
    @ApiResponse({ status: 201, description: 'Salon created successfully' })
    @ApiResponse({ status: 400, description: 'User already owns a salon' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createSalonDto: CreateSalonDto, @Request() req) {
        return this.salonsService.create(createSalonDto, req.user.id);
    }

    @Get()
    @ApiOperation({
        summary: 'Get all salons with filters',
        description: 'Retrieve all verified and active salons. Supports filtering by city, gender specialization, rating, and search term.'
    })
    @ApiQuery({ name: 'city', required: false, description: 'Filter by city (e.g., Colombo, Kandy)' })
    @ApiQuery({ name: 'gender', required: false, enum: SalonGenderSpecialization, description: 'Filter by gender specialization' })
    @ApiQuery({ name: 'minRating', required: false, type: Number, description: 'Minimum rating (1-5)' })
    @ApiQuery({ name: 'search', required: false, description: 'Search by salon name or description' })
    @ApiResponse({ status: 200, description: 'List of salons retrieved successfully' })
    findAll(
        @Query('city') city?: string,
        @Query('gender') gender?: SalonGenderSpecialization,
        @Query('minRating') minRating?: number,
        @Query('search') search?: string,
    ) {
        return this.salonsService.findAll({
            city,
            genderSpecialization: gender,
            minRating: minRating ? Number(minRating) : undefined,
            search,
            isActive: true,
        });
    }

    @Get('nearby')
    @ApiOperation({
        summary: 'Find salons nearby',
        description: 'Find salons within a specified radius of given coordinates. Uses Haversine formula for distance calculation.'
    })
    @ApiQuery({ name: 'lat', required: true, description: 'Latitude (e.g., 6.9271 for Colombo)' })
    @ApiQuery({ name: 'lng', required: true, description: 'Longitude (e.g., 79.8612 for Colombo)' })
    @ApiQuery({ name: 'radius', required: false, description: 'Search radius in kilometers (default: 10)' })
    @ApiResponse({ status: 200, description: 'Nearby salons retrieved successfully' })
    findNearby(
        @Query('lat') lat: string,
        @Query('lng') lng: string,
        @Query('radius') radius?: string,
    ) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lng);
        const radiusKm = radius ? parseFloat(radius) : 10;

        return this.salonsService.searchNearby(latitude, longitude, radiusKm);
    }

    @Get('slug/:slug')
    @ApiOperation({
        summary: 'Get salon by slug',
        description: 'Retrieve salon details using URL-friendly slug'
    })
    @ApiParam({ name: 'slug', description: 'Salon slug' })
    @ApiResponse({ status: 200, description: 'Salon retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Salon not found' })
    findBySlug(@Param('slug') slug: string) {
        return this.salonsService.findBySlug(slug);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-salon')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get my salon',
        description: 'Retrieve authenticated user\'s salon (salon owner only)'
    })
    @ApiResponse({ status: 200, description: 'Salon retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'No salon found for this user' })
    getOwnSalon(@Request() req) {
        return this.salonsService.findByOwner(req.user.id);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get salon by ID',
        description: 'Retrieve detailed salon information including services and staff'
    })
    @ApiParam({ name: 'id', description: 'Salon ID' })
    @ApiResponse({ status: 200, description: 'Salon retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Salon not found' })
    findOne(@Param('id') id: string) {
        return this.salonsService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Update salon',
        description: 'Update salon details. Only salon owner can update their salon.'
    })
    @ApiParam({ name: 'id', description: 'Salon ID' })
    @ApiResponse({ status: 200, description: 'Salon updated successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not the salon owner' })
    @ApiResponse({ status: 404, description: 'Salon not found' })
    update(@Param('id') id: string, @Body() updateSalonDto: UpdateSalonDto, @Request() req) {
        return this.salonsService.update(+id, updateSalonDto, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Delete salon',
        description: 'Delete salon. Only salon owner can delete their salon.'
    })
    @ApiParam({ name: 'id', description: 'Salon ID' })
    @ApiResponse({ status: 200, description: 'Salon deleted successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not the salon owner' })
    @ApiResponse({ status: 404, description: 'Salon not found' })
    remove(@Param('id') id: string, @Request() req) {
        return this.salonsService.remove(+id, req.user.id);
    }
}
