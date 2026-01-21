import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum SubscriptionType {
    CUSTOMER_FREE = 'customer_free',
    CUSTOMER_PLUS = 'customer_plus',
    CUSTOMER_PRO = 'customer_pro',
    SALON_STARTER = 'salon_starter',
    SALON_GROWTH = 'salon_growth',
    SALON_PRO = 'salon_pro',
}

export enum SubscriptionStatus {
    ACTIVE = 'active',
    CANCELLED = 'cancelled',
    EXPIRED = 'expired',
    SUSPENDED = 'suspended',
    TRIAL = 'trial',
}

@Entity('subscriptions')
export class Subscription {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column({
        type: 'enum',
        enum: SubscriptionType
    })
    type: SubscriptionType;

    @Column({
        type: 'enum',
        enum: SubscriptionStatus,
        default: SubscriptionStatus.ACTIVE
    })
    status: SubscriptionStatus;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'varchar', length: 10, default: 'LKR' })
    currency: string;

    @Column({ type: 'varchar', length: 50 })
    billingCycle: string; // 'monthly', 'yearly'

    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp' })
    endDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    nextBillingDate: Date;

    @Column({ type: 'boolean', default: true })
    autoRenew: boolean;

    @Column({ type: 'timestamp', nullable: true })
    cancelledAt: Date;

    @Column({ type: 'varchar', length: 255, nullable: true })
    cancellationReason: string;

    @Column({ type: 'json', nullable: true })
    features: {
        tryOnCredits?: number;
        staffSeats?: number;
        analytics?: boolean;
        featuredListing?: boolean;
        prioritySupport?: boolean;
        stylePacks?: string[];
    };

    @Column({ type: 'int', nullable: true })
    trialDays: number;

    @Column({ type: 'boolean', default: false })
    isTrialUsed: boolean;

    @Column({ type: 'varchar', length: 255, nullable: true })
    stripeSubscriptionId: string; // Or other payment gateway ID

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
