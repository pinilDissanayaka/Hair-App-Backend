import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Payments')
@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) {}

    @UseGuards(JwtAuthGuard)
    @Get('my-payments')
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Get my payment history',
        description: 'Retrieve all payment transactions for the authenticated user'
    })
    @ApiResponse({ status: 200, description: 'Payments retrieved successfully' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    findMyPayments(@Request() req) {
        return this.paymentsService.findByUser(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Create payment',
        description: 'Process a payment for booking, subscription, or credits. Supports multiple payment methods (Card, Bank Transfer, LankaQR, Cash).'
    })
    @ApiResponse({ status: 201, description: 'Payment created successfully' })
    @ApiResponse({ status: 400, description: 'Invalid payment data' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    create(@Body() createPaymentDto: any, @Request() req) {
        return this.paymentsService.create({
            ...createPaymentDto,
            userId: req.user.id,
        });
    }
}
