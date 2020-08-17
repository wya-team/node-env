import { MinLength, MaxLength, IsNotEmpty, IsEmail } from 'class-validator';
import {
	Entity,
	BaseEntity,
	Column,
	CreateDateColumn,
	UpdateDateColumn,
	ObjectID,
	ObjectIdColumn
} from 'typeorm';

@Entity('user')
export class User extends BaseEntity {
	// Mongo Tips: 你必须使用 @ObjectIdColumn 而不是 @PrimaryColumn 或 @PrimaryGeneratedColumn
	@ObjectIdColumn()
	id: ObjectID;

	@Column()
	@IsEmail()
	@IsNotEmpty({ message: '邮箱地址必填' })
	email: string;

	@Column()
	username: string;

	@Column()
	@IsNotEmpty({ message: '密码必填' })
	password: string;

	@Column()
	passsalt: string;

	@Column()
	role: string; // 用于管理角色权限

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;
}
