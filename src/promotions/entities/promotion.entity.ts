import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Salon } from "../../salons/entities/salon.entity";
import { Service } from "../../salons/entities/service.entity";

export enum PromotionType {
    PERCENTAGE_DISCOUNT = 'percentage_discount',
    FIXED_DISCOUNT = 'fixed_discount',
    FEATURED_LISTING = 'featured_listing',
    PACKAGE_DEAL = 'package_deal',
    FIRST_TIME_CUSTOMER = 'first_time_customer',
    SEASONAL = 'seasonal',
}

export enum PromotionStatus {
    ACTIVE = 'active',
    INACTIVE = 'inactive',
    EXPIRED = 'expired',
    SCHEDULED = 'scheduled',
}

@Entity('promotions')
export class Promotion {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Salon)
    @JoinColumn({ name: 'salonId' })
    salon: Salon;

    @Column()
    salonId: number;

    @Column({ type: 'varchar', length: 255 })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: PromotionType
    })
    type: PromotionType;

    @Column({ type: 'varchar', length: 50, unique: true })
    code: string; // Promo code

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    discountValue: number; // Percentage or fixed amount

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    minPurchaseAmount: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    maxDiscountAmount: number; // Cap for percentage discounts

    @Column({ type: 'int', nullable: true })
    usageLimit: number; // Total usage limit

    @Column({ type: 'int', default: 0 })
    usageCount: number; // Current usage count

    @Column({ type: 'int', nullable: true })
    perCustomerLimit: number; // Usage limit per customer

    @Column({ type: 'timestamp' })
    startDate: Date;

    @Column({ type: 'timestamp' })
    endDate: Date;

    @Column({
        type: 'enum',
        enum: PromotionStatus,
        default: PromotionStatus.ACTIVE
    })
    status: PromotionStatus;

    @Column({ type: 'simple-array', nullable: true })
    applicableServiceIds: number[]; // Specific services this applies to

    @Column({ type: 'simple-array', nullable: true })
    excludedServiceIds: number[]; // Services this doesn't apply to

    @Column({ type: 'simple-array', nullable: true })
    applicableDays: string[]; // ['monday', 'tuesday', ...]

    @Column({ type: 'varchar', length: 500, nullable: true })
    imageUrl: string; // Promotional banner

    @Column({ type: 'boolean', default: false })
    isFirstTimeOnly: boolean;

    @Column({ type: 'boolean', default: true })
    isVisible: boolean; // Show in listings

    @Column({ type: 'boolean', default: false })
    requiresCode: boolean; // Must enter code or auto-apply

    @Column({ type: 'json', nullable: true })
    termsAndConditions: string[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
