import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Salon } from "./salon.entity";

export enum StaffRole {
    OWNER = 'owner',
    MANAGER = 'manager',
    SENIOR_STYLIST = 'senior_stylist',
    STYLIST = 'stylist',
    JUNIOR_STYLIST = 'junior_stylist',
    BARBER = 'barber',
    COLORIST = 'colorist',
    BEAUTICIAN = 'beautician',
    RECEPTIONIST = 'receptionist',
}

@Entity('staff')
export class Staff {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Salon, salon => salon.staff, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'salonId' })
    salon: Salon;

    @Column()
    salonId: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'varchar', length: 255, nullable: true })
    email: string;

    @Column({ type: 'varchar', length: 20, nullable: true })
    phone: string;

    @Column({
        type: 'enum',
        enum: StaffRole,
        default: StaffRole.STYLIST
    })
    role: StaffRole;

    @Column({ type: 'text', nullable: true })
    bio: string;

    @Column({ type: 'varchar', length: 500, nullable: true })
    profileImage: string;

    @Column({ type: 'simple-array', nullable: true })
    specializations: string[]; // e.g., ['haircut', 'coloring', 'bridal']

    @Column({ type: 'int', default: 0 })
    yearsOfExperience: number;

    @Column({ type: 'simple-array', nullable: true })
    languagesSpoken: string[]; // ['en', 'si', 'ta']

    @Column({ type: 'json', nullable: true })
    workingHours: {
        monday?: { start: string; end: string; available?: boolean };
        tuesday?: { start: string; end: string; available?: boolean };
        wednesday?: { start: string; end: string; available?: boolean };
        thursday?: { start: string; end: string; available?: boolean };
        friday?: { start: string; end: string; available?: boolean };
        saturday?: { start: string; end: string; available?: boolean };
        sunday?: { start: string; end: string; available?: boolean };
    };

    @Column({ type: 'float', default: 0 })
    rating: number;

    @Column({ type: 'int', default: 0 })
    totalReviews: number;

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: true })
    acceptsBookings: boolean;

    @Column({ type: 'int', default: 0 })
    completedBookings: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
