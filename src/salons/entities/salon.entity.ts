import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Service } from "./service.entity";
import { Staff } from "./staff.entity";

export enum SalonSubscriptionTier {
    STARTER = 'starter',
    GROWTH = 'growth',
    PRO = 'pro',
}

export enum VerificationStatus {
    PENDING = 'pending',
    VERIFIED = 'verified',
    REJECTED = 'rejected',
}

export enum SalonGenderSpecialization {
    MALE = 'male',
    FEMALE = 'female',
    UNISEX = 'unisex',
}

@Entity('salons')
export class Salon {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => User, { onDelete: 'CASCADE' })
    @JoinColumn()
    owner: User;

    @Column()
    ownerId: number;

    @Column({ type: 'varchar', length: 255 })
    businessName: string;

    @Column({ type: 'varchar', length: 500, unique: true })
    slug: string; // URL-friendly version of business name

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 20 })
    phone: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string;

    @Column({ type: 'text' })
    address: string;

    @Column({ type: 'varchar', length: 100 })
    city: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    district: string;

    @Column({ type: 'varchar', length: 100, nullable: true })
    province: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    postalCode: string;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    latitude: number;

    @Column({ type: 'decimal', precision: 10, scale: 7, nullable: true })
    longitude: number;

    @Column({
        type: 'enum',
        enum: SalonGenderSpecialization,
        default: SalonGenderSpecialization.UNISEX
    })
    genderSpecialization: SalonGenderSpecialization;

    @Column({ type: 'simple-array', nullable: true })
    languagesSpoken: string[]; // ['en', 'si', 'ta']

    @Column({ type: 'json', nullable: true })
    workingHours: {
        monday?: { open: string; close: string; closed?: boolean };
        tuesday?: { open: string; close: string; closed?: boolean };
        wednesday?: { open: string; close: string; closed?: boolean };
        thursday?: { open: string; close: string; closed?: boolean };
        friday?: { open: string; close: string; closed?: boolean };
        saturday?: { open: string; close: string; closed?: boolean };
        sunday?: { open: string; close: string; closed?: boolean };
    };

    @Column({ type: 'simple-array', nullable: true })
    images: string[]; // Array of image URLs

    @Column({ type: 'varchar', length: 500, nullable: true })
    coverImage: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    logoImage: string;

    @Column({
        type: 'enum',
        enum: SalonSubscriptionTier,
        default: SalonSubscriptionTier.STARTER
    })
    subscriptionTier: SalonSubscriptionTier;

    @Column({ type: 'timestamp', nullable: true })
    subscriptionStartDate: Date;

    @Column({ type: 'timestamp', nullable: true })
    subscriptionEndDate: Date;

    @Column({
        type: 'enum',
        enum: VerificationStatus,
        default: VerificationStatus.PENDING
    })
    verificationStatus: VerificationStatus;

    @Column({ type: 'text', nullable: true })
    verificationNotes: string; // Admin notes for verification

    @Column({ type: 'varchar', length: 255, nullable: true })
    businessRegistrationNumber: string;

    @Column({ type: 'float', default: 0 })
    averageRating: number;

    @Column({ type: 'int', default: 0 })
    totalReviews: number;

    @Column({ type: 'boolean', default: true })
    acceptsWalkIns: boolean;

    @Column({ type: 'boolean', default: true })
    acceptsOnlineBookings: boolean;

    @Column({ type: 'int', default: 0 })
    featuredListingCredits: number; // For promotional featured listing

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'int', default: 0 })
    viewCount: number; // Track profile views

    @OneToMany(() => Service, service => service.salon)
    services: Service[];

    @OneToMany(() => Staff, staff => staff.salon)
    staff: Staff[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
