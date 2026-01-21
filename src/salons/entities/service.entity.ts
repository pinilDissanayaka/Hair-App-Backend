import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Salon } from "./salon.entity";

export enum ServiceCategory {
    HAIRCUT = 'haircut',
    HAIR_COLOR = 'hair_color',
    HAIR_TREATMENT = 'hair_treatment',
    STYLING = 'styling',
    BRIDAL = 'bridal',
    BEARD = 'beard',
    FACIAL = 'facial',
    MASSAGE = 'massage',
    MANICURE_PEDICURE = 'manicure_pedicure',
    MAKEUP = 'makeup',
    OTHER = 'other',
}

export enum ServiceGender {
    MALE = 'male',
    FEMALE = 'female',
    UNISEX = 'unisex',
}

@Entity('services')
export class Service {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Salon, salon => salon.services, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'salonId' })
    salon: Salon;

    @Column()
    salonId: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: ServiceCategory,
        default: ServiceCategory.HAIRCUT
    })
    category: ServiceCategory;

    @Column({
        type: 'enum',
        enum: ServiceGender,
        default: ServiceGender.UNISEX
    })
    gender: ServiceGender;

    @Column({ type: 'decimal', precision: 10, scale: 2 })
    price: number;

    @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
    discountedPrice: number;

    @Column({ type: 'int' })
    durationMinutes: number; // Duration in minutes

    @Column({ type: 'varchar', length: 500, nullable: true })
    image: string;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: false })
    isPopular: boolean; // Mark popular services

    @Column({ type: 'int', default: 0 })
    bookingCount: number; // Track how many times booked

    @Column({ type: 'simple-array', nullable: true })
    addOns: string[]; // Additional options/add-ons

    @Column({ type: 'json', nullable: true })
    addOnPrices: Record<string, number>; // Prices for add-ons

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
