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

	@CreateDateColumn()
	createdAt: Date;

	@UpdateDateColumn()
	updatedAt: Date;

	// 不写入到数据库
	token?: string;
	// TODO：考虑用构造器 new User
	// constructor(body: User) {
	// 	super();
	// 	this.email = body.email;
	// 	this.username = body.username;
	// }
}
