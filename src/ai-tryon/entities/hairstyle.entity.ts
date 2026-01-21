import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

export enum HairstyleCategory {
    SHORT = 'short',
    MEDIUM = 'medium',
    LONG = 'long',
    CURLY = 'curly',
    STRAIGHT = 'straight',
    WAVY = 'wavy',
    BRAIDED = 'braided',
    UPDO = 'updo',
    PONYTAIL = 'ponytail',
    BANGS = 'bangs',
    LAYERED = 'layered',
    BOB = 'bob',
    PIXIE = 'pixie',
    BUZZ_CUT = 'buzz_cut',
    FADE = 'fade',
    UNDERCUT = 'undercut',
    BRIDAL = 'bridal',
    FORMAL = 'formal',
    CASUAL = 'casual',
}

export enum HairstyleGender {
    MALE = 'male',
    FEMALE = 'female',
    UNISEX = 'unisex',
}

@Entity('hairstyles')
export class Hairstyle {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 255 })
    name: string;

    @Column({ type: 'text', nullable: true })
    description: string;

    @Column({ type: 'varchar', length: 500 })
    imageUrl: string; // Reference hairstyle image

    @Column({ type: 'varchar', length: 500, nullable: true })
    thumbnailUrl: string;

    @Column({
        type: 'enum',
        enum: HairstyleCategory
    })
    category: HairstyleCategory;

    @Column({
        type: 'enum',
        enum: HairstyleGender,
        default: HairstyleGender.UNISEX
    })
    gender: HairstyleGender;

    @Column({ type: 'simple-array', nullable: true })
    tags: string[]; // ['trendy', 'professional', 'casual', 'summer']

    @Column({ type: 'boolean', default: true })
    isActive: boolean;

    @Column({ type: 'boolean', default: false })
    isFeatured: boolean;

    @Column({ type: 'boolean', default: false })
    isPremium: boolean; // Only available for Plus/Pro users

    @Column({ type: 'int', default: 0 })
    tryOnCount: number; // Track popularity

    @Column({ type: 'int', default: 0 })
    saveCount: number; // How many saved this style

    @Column({ type: 'varchar', length: 255, nullable: true })
    stylePack: string; // 'bridal', 'work', 'school'

    @Column({ type: 'int', default: 0 })
    sortOrder: number; // For manual ordering

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
