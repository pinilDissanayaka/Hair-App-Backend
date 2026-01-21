import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { Salon } from "../../salons/entities/salon.entity";
import { Staff } from "../../salons/entities/staff.entity";
import { Service } from "../../salons/entities/service.entity";

export enum PortfolioCategory {
    HAIRCUT = 'haircut',
    HAIR_COLOR = 'hair_color',
    HAIR_TREATMENT = 'hair_treatment',
    STYLING = 'styling',
    BRIDAL = 'bridal',
    BEARD = 'beard',
    MAKEUP = 'makeup',
    NAILS = 'nails',
    OTHER = 'other',
}

@Entity('portfolio')
export class Portfolio {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Salon)
    @JoinColumn({ name: 'salonId' })
    salon: Salon;

    @Column()
    salonId: number;

    @ManyToOne(() => Staff, { nullable: true })
    @JoinColumn({ name: 'staffId' })
    staff: Staff;

    @Column({ nullable: true })
    staffId: number;

    @ManyToOne(() => Service, { nullable: true })
    @JoinColumn({ name: 'serviceId' })
    service: Service;

    @Column({ nullable: true })
    serviceId: number;

    @Column({ type: 'varchar', length: 255, nullable: true })
    title: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({
        type: 'enum',
        enum: PortfolioCategory
    })
    category: PortfolioCategory;

    @Column({ type: 'varchar', length: 500, nullable: true })
    beforeImage: string;

    @Column({ type: 'varchar', length: 500 })
    afterImage: string;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[]; // ['balayage', 'long hair', 'brunette']

    @Column({ type: 'boolean', default: false })
    isFeatured: boolean;

    @Column({ type: 'boolean', default: true })
    isVisible: boolean;

    @Column({ type: 'int', default: 0 })
    viewCount: number;

    @Column({ type: 'int', default: 0 })
    likeCount: number;

    @Column({ type: 'int', default: 0 })
    shareCount: number;

    @Column({ type: 'int', default: 0 })
    sortOrder: number; // Manual ordering

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
