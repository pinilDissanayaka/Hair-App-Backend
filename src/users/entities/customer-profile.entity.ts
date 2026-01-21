import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "./user.entity";

export enum SubscriptionTier {
    FREE = 'free',
    PLUS = 'plus',
    PRO = 'pro',
}

@Entity('customer_profiles')
export class CustomerProfile {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn()
    user: User;

    @Column()
    userId: number;

    @Column({
        type: 'enum',
        enum: SubscriptionTier,
        default: SubscriptionTier.FREE
    })
    subscriptionTier: SubscriptionTier;

    @Column({ type: 'int', default: 0 })
    tryOnCredits: number; // Available try-on credits

    @Column({ type: 'int', default: 0 })
    weeklyTryOnsUsed: number; // Track weekly usage for free tier

    @Column({ type: 'timestamp', nullable: true })
    weeklyResetDate: Date; // When to reset weekly counter

    @Column({ type: 'timestamp', nullable: true })
    subscriptionStartDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    subscriptionEndDate: Date;

    @Column({ type: 'boolean', default: true })
    autoRenew: boolean;

    @Column({ type: 'json', nullable: true })
    preferences: {
        showAds?: boolean;
        notificationEnabled?: boolean;
        saveHistory?: boolean;
    };

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
