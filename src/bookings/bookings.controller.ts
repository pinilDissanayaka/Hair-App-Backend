import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery, ApiParam } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { BookingStatus } from './entities/booking.entity';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingsController {
    constructor(private readonly bookingsService: BookingsService) {}

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Create a new booking',
        description: 'Book an appointment at a salon. Checks slot availability before creating the booking.'
    })
    @ApiResponse({ status: 201, description: 'Booking created successfully' })
    @ApiResponse({ status: 400, description: 'Time slot not available or invalid data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'Service or staff not found' })
    create(@Body() createBookingDto: CreateBookingDto, @Request() req) {
        return this.bookingsService.create(createBookingDto, req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('my-bookings')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get my bookings',
        description: 'Retrieve all bookings for the authenticated customer'
    })
    @ApiQuery({ name: 'status', required: false, enum: BookingStatus, description: 'Filter by booking status' })
    @ApiResponse({ status: 200, description: 'Bookings retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getMyBookings(@Request() req, @Query('status') status?: BookingStatus) {
        return this.bookingsService.findAll({
            customerId: req.user.id,
            ...(status && { status }),
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('salon/:salonId')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get salon bookings',
        description: 'Retrieve all bookings for a specific salon within a date range'
    })
    @ApiParam({ name: 'salonId', description: 'Salon ID' })
    @ApiQuery({ name: 'fromDate', required: false, description: 'Start date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'toDate', required: false, description: 'End date (YYYY-MM-DD)' })
    @ApiResponse({ status: 200, description: 'Salon bookings retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    getSalonBookings(
        @Param('salonId') salonId: string,
        @Query('fromDate') fromDate?: string,
        @Query('toDate') toDate?: string,
    ) {
        return this.bookingsService.findAll({
            salonId: +salonId,
            ...(fromDate && { fromDate: new Date(fromDate) }),
            ...(toDate && { toDate: new Date(toDate) }),
        });
    }

    @Get('available-slots')
    @ApiOperation({
        summary: 'Get available time slots',
        description: 'Check available appointment slots for a service on a specific date. Returns array of available times in HH:MM format.'
    })
    @ApiQuery({ name: 'salonId', required: true, description: 'Salon ID' })
    @ApiQuery({ name: 'date', required: true, description: 'Date (YYYY-MM-DD)' })
    @ApiQuery({ name: 'serviceId', required: true, description: 'Service ID' })
    @ApiQuery({ name: 'staffId', required: false, description: 'Staff ID (optional)' })
    @ApiResponse({
        status: 200,
        description: 'Available slots retrieved',
        schema: {
            example: ['09:00', '09:30', '10:00', '10:30', '11:00']
        }
    })
    @ApiResponse({ status: 404, description: 'Service not found' })
    getAvailableSlots(
        @Query('salonId') salonId: string,
        @Query('date') date: string,
        @Query('serviceId') serviceId: string,
        @Query('staffId') staffId?: string,
    ) {
        return this.bookingsService.getAvailableSlots(
            +salonId,
            new Date(date),
            +serviceId,
            staffId ? +staffId : undefined,
        );
    }

    @Get('reference/:reference')
    @ApiOperation({
        summary: 'Get booking by reference',
        description: 'Retrieve booking details using unique booking reference code'
    })
    @ApiParam({ name: 'reference', description: 'Booking reference (e.g., BK-ABC123)' })
    @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    findByReference(@Param('reference') reference: string) {
        return this.bookingsService.findByReference(reference);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get booking by ID', description: 'Retrieve detailed booking information' })
    @ApiParam({ name: 'id', description: 'Booking ID' })
    @ApiResponse({ status: 200, description: 'Booking retrieved successfully' })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    findOne(@Param('id') id: string) {
        return this.bookingsService.findOne(+id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/cancel')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Cancel booking',
        description: 'Cancel an existing booking. Only the customer who created the booking can cancel it.'
    })
    @ApiParam({ name: 'id', description: 'Booking ID' })
    @ApiResponse({ status: 200, description: 'Booking cancelled successfully' })
    @ApiResponse({ status: 400, description: 'Booking cannot be cancelled' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 403, description: 'Forbidden - Not your booking' })
    cancel(@Param('id') id: string, @Body('reason') reason: string, @Request() req) {
        return this.bookingsService.cancel(+id, req.user.id, reason);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/reschedule')
    reschedule(
        @Param('id') id: string,
        @Body('newDate') newDate: string,
        @Body('newTime') newTime: string,
        @Request() req,
    ) {
        return this.bookingsService.reschedule(+id, req.user.id, new Date(newDate), newTime);
    }

    @UseGuards(JwtAuthGuard)
    @Patch(':id/status')
    updateStatus(@Param('id') id: string, @Body('status') status: BookingStatus) {
        return this.bookingsService.updateStatus(+id, status);
    }
}
