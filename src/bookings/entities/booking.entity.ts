import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Salon } from "../../salons/entities/salon.entity";
import { Service } from "../../salons/entities/service.entity";
import { Staff } from "../../salons/entities/staff.entity";

export enum BookingStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    IN_PROGRESS = 'in_progress',
    COMPLETED = 'completed',
    CANCELLED = 'cancelled',
    NO_SHOW = 'no_show',
    RESCHEDULED = 'rescheduled',
}

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    PARTIALLY_PAID = 'partially_paid',
    REFUNDED = 'refunded',
    FAILED = 'failed',
}

@Entity('bookings')
export class Booking {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'customerId' })
    customer: User;

    @Column()
    customerId: number;

    @ManyToOne(() => Salon)
    @JoinColumn({ name: 'salonId' })
    salon: Salon;

    @Column()
    salonId: number;

    @ManyToOne(() => Service)
    @JoinColumn({ name: 'serviceId' })
    service: Service;

    @Column()
    serviceId: number;

    @ManyToOne(() => Staff, { nullable: true })
    @JoinColumn({ name: 'staffId' })
    staff: Staff;

    @Column({ nullable: true })
    staffId: number;

    @Column({ type: 'timestamp' })
    appointmentDate: Date;

    @Column({ type: 'time' })
    appointmentTime: string; // HH:MM format

    @Column({ type: 'int' })
    durationMinutes: number;

    @Column({
        type: 'enum',
        enum: BookingStatus,
        default: BookingStatus.PENDING
    })
    status: BookingStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    totalPrice: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    discountAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    finalPrice: number;

    @Column({
        type: 'enum',
        enum: PaymentStatus,
        default: PaymentStatus.PENDING
    })
    paymentStatus: PaymentStatus;

    @Column({ type: 'varchar', length: 50, nullable: true })
    paymentMethod: string; // 'card', 'bank_transfer', 'lankaQR', 'cash'

    @Column({ type: 'varchar', length: 255, nullable: true })
    paymentTransactionId: string;

    @Column({ type: 'simple-array', nullable: true })
    selectedAddOns: string[];

    @Column({ type: 'text', nullable: true })
    customerNotes: string; // Special requests from customer

    @Column({ type: 'text', nullable: true })
    salonNotes: string; // Internal notes for salon staff

    @Column({ type: 'varchar', length: 255, nullable: true })
    cancellationReason: string;

    @Column({ type: 'timestamp', nullable: true })
    cancelledAt: Date;

    @Column({ type: 'varchar', length: 100, nullable: true })
    bookingReference: string; // Unique booking reference code

    @Column({ type: 'boolean', default: false })
    isReminderSent: boolean;

    @Column({ type: 'timestamp', nullable: true })
    reminderSentAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    completedAt: Date;

    @Column({ type: 'int', nullable: true })
    previousBookingId: number; // For rescheduled bookings

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
