import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { User } from "../../users/entities/user.entity";

export enum ProcessingStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity('tryon_sessions')
export class TryOnSession {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User)
    @JoinColumn({ name: 'userId' })
    user: User;

    @Column()
    userId: number;

    @Column({ type: 'varchar', length: 500 })
    originalImageUrl: string; // User's selfie

    @Column({ type: 'varchar', length: 500, nullable: true })
    resultImageUrl: string; // Generated result

    @Column({ type: 'int', nullable: true })
    hairstyleId: number; // Reference to hairstyle catalog

    @Column({ type: 'varchar', length: 255, nullable: true })
    hairstyleName: string;

    @Column({
        type: 'enum',
        enum: ProcessingStatus,
        default: ProcessingStatus.PENDING
    })
    status: ProcessingStatus;

    @Column({ type: 'text', nullable: true })
    errorMessage: string;

    @Column({ type: 'int', default: 0 })
    processingTimeMs: number; // Track processing time

    @Column({ type: 'boolean', default: false })
    isSaved: boolean; // User saved this result

    @Column({ type: 'boolean', default: false })
    isShared: boolean; // User shared this result

    @Column({ type: 'varchar', length: 100, nullable: true })
    shareToken: string; // Unique token for sharing

    @Column({ type: 'json', nullable: true })
    geminiMetadata: {
        model?: string;
        cost?: number;
        batchProcessed?: boolean;
    };

    @Column({ type: 'int', default: 0 })
    viewCount: number;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
