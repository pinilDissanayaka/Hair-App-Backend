import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Booking } from "../../bookings/entities/booking.entity";

export enum PaymentType {
    BOOKING = 'booking',
    SUBSCRIPTION = 'subscription',
    CREDITS = 'credits', // Buy try-on credits
}

export enum PaymentMethod {
    CARD = 'card',
    BANK_TRANSFER = 'bank_transfer',
    LANKAQR = 'lankaqr',
    CASH = 'cash',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
    REFUNDED = 'refunded',
    CANCELLED = 'cancelled',
}

@Entity('payments')
export class Payment {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column({
        type: 'enum',
        enum: PaymentType
    })
    type: PaymentType;

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    @Column({ nullable: true })
    bookingId: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    amount: number;

    @Column({ type: 'varchar', length: 10, default: 'LKR' })
    currency: string;

    @Column({
        type: 'enum',
        enum: PaymentMethod
    })
    paymentMethod: PaymentMethod;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    status: PaymentStatus;

    @Column({ type: 'varchar', length: 255, unique: true })
    transactionId: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    externalTransactionId: string; // From payment gateway

    @Column({ type: 'varchar', length: 255, nullable: true })
    paymentGateway: string; // e.g., 'stripe', 'payhere', 'genie'

    @Column({ type: 'json', nullable: true })
    gatewayResponse: Record<string, any>; // Store payment gateway response

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    receiptUrl: string; // Link to receipt/invoice

    @Column({ type: 'timestamp', nullable: true })
    paidAt: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    refundReason: string;

    @Column({ type: 'timestamp', nullable: true })
    refundedAt: Date;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    refundedAmount: number;

    @Column({ type: 'json', nullable: true })
    metadata: {
        subscriptionTier?: string;
        creditsCount?: number;
        bookingReference?: string;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
