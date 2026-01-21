import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";
import { Salon } from "../../salons/entities/salon.entity";
import { Booking } from "../../bookings/entities/booking.entity";
import { Staff } from "../../salons/entities/staff.entity";

@Entity('reviews')
export class Review {
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

    @ManyToOne(() => Booking, { nullable: true })
    @JoinColumn({ name: 'bookingId' })
    booking: Booking;

    @Column({ nullable: true })
    bookingId: number;

    @ManyToOne(() => Staff, { nullable: true })
    @JoinColumn({ name: 'staffId' })
    staff: Staff;

    @Column({ nullable: true })
    staffId: number;

    @Column({ type: 'int' })
    rating: number; // 1-5 stars

    @Column({ type: 'text', nullable: true })
    comment: string;

    @Column({ type: 'simple-array', nullable: true })
    images: string[]; // Before/after photos

    @Column({ type: 'json', nullable: true })
    detailedRatings: {
        service?: number; // 1-5
        cleanliness?: number; // 1-5
        value?: number; // 1-5
        staff?: number; // 1-5
    };

    @Column({ type: 'boolean', default: true })
    isVerified: boolean; // Verified booking-based review

    @Column({ type: 'boolean', default: true })
    isVisible: boolean; // Can be hidden by admin/salon

    @Column({ type: 'text', nullable: true })
    salonResponse: string; // Salon owner's response

    @Column({ type: 'timestamp', nullable: true })
    salonResponseDate: Date;

    @Column({ type: 'int', default: 0 })
    helpfulCount: number; // How many found this review helpful

    @Column({ type: 'boolean', default: false })
    isFeatured: boolean; // Featured reviews

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
