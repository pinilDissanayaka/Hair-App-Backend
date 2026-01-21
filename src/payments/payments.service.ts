import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Payment, PaymentType, PaymentMethod, PaymentStatus } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
    constructor(
        @InjectRepository(Payment)
        private readonly paymentRepository: Repository<Payment>,
    ) {}

    async create(data: Partial<Payment>): Promise<Payment> {
        const payment = this.paymentRepository.create({
            ...data,
            transactionId: this.generateTransactionId(),
            status: PaymentStatus.PENDING,
        });

        return await this.paymentRepository.save(payment);
    }

    async findByUser(userId: number): Promise<Payment[]> {
        return await this.paymentRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }

    async updateStatus(transactionId: string, status: PaymentStatus): Promise<Payment> {
        const payment = await this.paymentRepository.findOne({
            where: { transactionId },
        });

        if (!payment) {
            throw new Error('Payment not found');
        }

        payment.status = status;
        if (status === PaymentStatus.COMPLETED) {
            payment.paidAt = new Date();
        }

        return await this.paymentRepository.save(payment);
    }

    private generateTransactionId(): string {
        return `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
    }
}
