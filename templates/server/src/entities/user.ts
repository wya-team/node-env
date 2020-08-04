import { MinLength, IsNotEmpty, IsEmail } from 'class-validator';
import {
	Entity,
	BaseEntity,
	Column,
	PrimaryGeneratedColumn,
	CreateDateColumn,
	UpdateDateColumn
} from 'typeorm';

@Entity('user')
export class User extends BaseEntity {
	@PrimaryGeneratedColumn()
	id: string;

	// @Column()
	// @MinLength(4, { message: '用户名至少4位数' })
	// @IsNotEmpty({ message: '用户名必填' })
	// username: string;

	// @Column()
	// @MinLength(6, { message: '密码至少六位数' })
	// password: string;

	@Column()
	@IsEmail()
	email: string;

	// @Column()
	// passsalt: string;

	// @Column()
	// study: boolean;

	// @Column()
	// role: string;

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
