import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { Booking, BookingStatus, PaymentStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { Service } from '../salons/entities/service.entity';
import { Staff } from '../salons/entities/staff.entity';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private readonly bookingRepository: Repository<Booking>,
        @InjectRepository(Service)
        private readonly serviceRepository: Repository<Service>,
        @InjectRepository(Staff)
        private readonly staffRepository: Repository<Staff>,
    ) {}

    async create(createBookingDto: CreateBookingDto, customerId: number): Promise<Booking> {
        // Get service details
        const service = await this.serviceRepository.findOne({
            where: { id: createBookingDto.serviceId },
        });

        if (!service) {
            throw new NotFoundException('Service not found');
        }

        // Check if staff exists (if provided)
        if (createBookingDto.staffId) {
            const staff = await this.staffRepository.findOne({
                where: { id: createBookingDto.staffId, salonId: createBookingDto.salonId },
            });

            if (!staff) {
                throw new NotFoundException('Staff not found');
            }

            if (!staff.acceptsBookings) {
                throw new BadRequestException('This staff member is not accepting bookings');
            }
        }

        // Check if slot is available
        const isAvailable = await this.checkAvailability(
            createBookingDto.salonId,
            createBookingDto.appointmentDate,
            createBookingDto.appointmentTime,
            service.durationMinutes,
            createBookingDto.staffId,
        );

        if (!isAvailable) {
            throw new BadRequestException('This time slot is not available');
        }

        // Calculate prices
        const totalPrice = service.discountedPrice || service.price;
        const finalPrice = totalPrice; // TODO: Apply promotions if any

        // Generate booking reference
        const bookingReference = this.generateBookingReference();

        const booking = this.bookingRepository.create({
            ...createBookingDto,
            customerId,
            durationMinutes: service.durationMinutes,
            totalPrice,
            finalPrice,
            discountAmount: 0,
            bookingReference,
            status: BookingStatus.PENDING,
            paymentStatus: createBookingDto.paymentMethod === 'cash'
                ? PaymentStatus.PENDING
                : PaymentStatus.PENDING,
        });

        return await this.bookingRepository.save(booking);
    }

    async findAll(filters?: {
        customerId?: number;
        salonId?: number;
        status?: BookingStatus;
        fromDate?: Date;
        toDate?: Date;
    }): Promise<Booking[]> {
        const query = this.bookingRepository.createQueryBuilder('booking');

        if (filters?.customerId) {
            query.andWhere('booking.customerId = :customerId', {
                customerId: filters.customerId,
            });
        }

        if (filters?.salonId) {
            query.andWhere('booking.salonId = :salonId', {
                salonId: filters.salonId,
            });
        }

        if (filters?.status) {
            query.andWhere('booking.status = :status', {
                status: filters.status,
            });
        }

        if (filters?.fromDate) {
            query.andWhere('booking.appointmentDate >= :fromDate', {
                fromDate: filters.fromDate,
            });
        }

        if (filters?.toDate) {
            query.andWhere('booking.appointmentDate <= :toDate', {
                toDate: filters.toDate,
            });
        }

        query.leftJoinAndSelect('booking.customer', 'customer');
        query.leftJoinAndSelect('booking.salon', 'salon');
        query.leftJoinAndSelect('booking.service', 'service');
        query.leftJoinAndSelect('booking.staff', 'staff');
        query.orderBy('booking.appointmentDate', 'ASC');
        query.addOrderBy('booking.appointmentTime', 'ASC');

        return await query.getMany();
    }

    async findOne(id: number): Promise<Booking> {
        const booking = await this.bookingRepository.findOne({
            where: { id },
            relations: ['customer', 'salon', 'service', 'staff'],
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    async findByReference(bookingReference: string): Promise<Booking> {
        const booking = await this.bookingRepository.findOne({
            where: { bookingReference },
            relations: ['customer', 'salon', 'service', 'staff'],
        });

        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        return booking;
    }

    async cancel(id: number, userId: number, reason?: string): Promise<Booking> {
        const booking = await this.findOne(id);

        // Check if user is authorized to cancel
        if (booking.customerId !== userId) {
            throw new ForbiddenException('You do not have permission to cancel this booking');
        }

        // Check if booking can be cancelled
        if (booking.status === BookingStatus.COMPLETED || booking.status === BookingStatus.CANCELLED) {
            throw new BadRequestException('This booking cannot be cancelled');
        }

        booking.status = BookingStatus.CANCELLED;
        if (reason) {
            booking.cancellationReason = reason;
        }
        booking.cancelledAt = new Date();

        return await this.bookingRepository.save(booking);
    }

    async reschedule(
        id: number,
        userId: number,
        newDate: Date,
        newTime: string,
    ): Promise<Booking> {
        const booking = await this.findOne(id);

        // Check if user is authorized to reschedule
        if (booking.customerId !== userId) {
            throw new ForbiddenException('You do not have permission to reschedule this booking');
        }

        // Check availability
        const isAvailable = await this.checkAvailability(
            booking.salonId,
            newDate,
            newTime,
            booking.durationMinutes,
            booking.staffId,
        );

        if (!isAvailable) {
            throw new BadRequestException('This time slot is not available');
        }

        // Create new booking with RESCHEDULED status
        booking.appointmentDate = newDate;
        booking.appointmentTime = newTime;
        booking.status = BookingStatus.RESCHEDULED;

        return await this.bookingRepository.save(booking);
    }

    async updateStatus(id: number, status: BookingStatus): Promise<Booking> {
        const booking = await this.findOne(id);
        booking.status = status;

        if (status === BookingStatus.COMPLETED) {
            booking.completedAt = new Date();
        }

        return await this.bookingRepository.save(booking);
    }

    async getAvailableSlots(
        salonId: number,
        date: Date,
        serviceId: number,
        staffId?: number,
    ): Promise<string[]> {
        // Get service duration
        const service = await this.serviceRepository.findOne({
            where: { id: serviceId },
        });

        if (!service) {
            throw new NotFoundException('Service not found');
        }

        // Get salon working hours for the given day
        // This is simplified - in production, you'd get actual working hours from the salon
        const workingHours = { start: '09:00', end: '18:00' };

        // Get existing bookings for the day
        const existingBookings = await this.findAll({
            salonId,
            fromDate: date,
            toDate: date,
            ...(staffId && { staffId }),
        });

        // Generate available slots
        const slots: string[] = [];
        const slotInterval = 30; // 30-minute intervals
        let currentTime = this.timeToMinutes(workingHours.start);
        const endTime = this.timeToMinutes(workingHours.end);

        while (currentTime + service.durationMinutes <= endTime) {
            const slotTime = this.minutesToTime(currentTime);

            // Check if slot conflicts with existing bookings
            const hasConflict = existingBookings.some((booking) => {
                const bookingStart = this.timeToMinutes(booking.appointmentTime);
                const bookingEnd = bookingStart + booking.durationMinutes;
                const slotEnd = currentTime + service.durationMinutes;

                return (
                    (currentTime >= bookingStart && currentTime < bookingEnd) ||
                    (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
                    (currentTime <= bookingStart && slotEnd >= bookingEnd)
                );
            });

            if (!hasConflict) {
                slots.push(slotTime);
            }

            currentTime += slotInterval;
        }

        return slots;
    }

    private async checkAvailability(
        salonId: number,
        date: Date,
        time: string,
        duration: number,
        staffId?: number,
    ): Promise<boolean> {
        const timeInMinutes = this.timeToMinutes(time);
        const endTimeInMinutes = timeInMinutes + duration;

        const conflictingBookings = await this.findAll({
            salonId,
            fromDate: date,
            toDate: date,
            ...(staffId && { staffId }),
        });

        return !conflictingBookings.some((booking) => {
            const bookingStart = this.timeToMinutes(booking.appointmentTime);
            const bookingEnd = bookingStart + booking.durationMinutes;

            return (
                (timeInMinutes >= bookingStart && timeInMinutes < bookingEnd) ||
                (endTimeInMinutes > bookingStart && endTimeInMinutes <= bookingEnd) ||
                (timeInMinutes <= bookingStart && endTimeInMinutes >= bookingEnd)
            );
        });
    }

    private timeToMinutes(time: string): number {
        const [hours, minutes] = time.split(':').map(Number);
        return hours * 60 + minutes;
    }

    private minutesToTime(minutes: number): string {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }

    private generateBookingReference(): string {
        const prefix = 'BK';
        const timestamp = Date.now().toString(36).toUpperCase();
        const random = Math.random().toString(36).substring(2, 6).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
}
