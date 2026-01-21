import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum NotificationType {
    BOOKING_CONFIRMATION = 'booking_confirmation',
    BOOKING_REMINDER = 'booking_reminder',
    BOOKING_CANCELLED = 'booking_cancelled',
    BOOKING_RESCHEDULED = 'booking_rescheduled',
    BOOKING_COMPLETED = 'booking_completed',
    REVIEW_REQUEST = 'review_request',
    PROMOTION = 'promotion',
    SUBSCRIPTION_EXPIRING = 'subscription_expiring',
    CREDITS_LOW = 'credits_low',
    NEW_MESSAGE = 'new_message',
    VERIFICATION_STATUS = 'verification_status',
}

export enum NotificationChannel {
    IN_APP = 'in_app',
    SMS = 'sms',
    EMAIL = 'email',
    WHATSAPP = 'whatsapp',
    PUSH = 'push',
}

export enum NotificationStatus {
    PENDING = 'pending',
    SENT = 'sent',
    FAILED = 'failed',
    READ = 'read',
}

@Entity('notifications')
export class Notification {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column({
        type: 'enum',
        enum: NotificationType
    })
    type: NotificationType;

    @Column({
        type: 'enum',
        enum: NotificationChannel
    })
    channel: NotificationChannel;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text' })
    message: string;

    @Column({
        type: 'enum',
        enum: NotificationStatus,
        default: NotificationStatus.PENDING
    })
    status: NotificationStatus;

    @Column({ type: 'json', nullable: true })
    data: {
        bookingId?: number;
        salonId?: number;
        promotionId?: number;
        actionUrl?: string;
    };

    @Column({ type: 'timestamp', nullable: true })
    scheduledFor: Date; // For scheduled notifications

    @Column({ type: 'timestamp', nullable: true })
    sentAt: Date;

    @Column({ type: 'timestamp', nullable: true })
    readAt: Date;

    @Column({ type: 'text', nullable: true })
    errorMessage: string; // If sending failed

    @Column({ type: 'int', default: 0 })
    retryCount: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    externalId: string; // ID from SMS/WhatsApp provider

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
