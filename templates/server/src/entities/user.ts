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
	@MaxLength(16, { message: '用户名至多十六位数' })
    @MinLength(4, { message: '用户名至少四位数' })
	@IsNotEmpty({ message: '用户名必填' })
    username: string;

    @Column()
	@IsNotEmpty({ message: '密码必填' })
    password: string;

    @Column()
	@IsEmail()
	@IsNotEmpty({ message: '邮箱地址必填' })
    email: string;

    @Column()
	@IsNotEmpty({ message: '秘钥盐必须生成' })
    passsalt: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

	// TODO：考虑用构造器 new User
	// constructor(body: User) {
	// 	super();
	// 	this.email = body.email;
	// 	this.username = body.username;
	// }
}
