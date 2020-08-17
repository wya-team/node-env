import { getMongoRepository, MongoRepository, ObjectID, ObjectIdColumn, DeleteResult } from 'typeorm';
import { Service } from 'typedi';
import { validate, ValidationError } from "class-validator";
import { User } from '../entities';

@Service()
export class UserService {
	repository: MongoRepository<User>

	constructor() {
		this.repository = getMongoRepository(User);
	}

	private async _check(data: User, opts?: any) {
		const errors = await validate(data);
		if (errors.length > 0) {
			throw errors; // ValidationError[]
		}
	}

	private async _checkEmail(email?: string) {
		if (email) {
			const checkRepeat = await this.checkRepeat(email);
			if (checkRepeat > 0) {
				throw new Error('该email已经注册');
			}
		}
	}

	async create(body: User): Promise<User> {
		const { email, username, password } = body;
		await this._checkEmail(email);

		const user = new User();
		user.email = email;
		user.username = username || (email && email.substr(0, email.indexOf('@')));

		if (password) {
			// 加密密码和salt, TODO： 使用sha1或者bcryptjs
			user.password = password;
			user.passsalt = password;
		}

		await this._check(user);
		return this.repository.save(user);
	}

	async update(user: User, newData: User): Promise<User> {
		const { email, username, password } = newData;
		let hasChanged = false;

		if (email) {
			await this._checkEmail(email);
			user.email = email;
			hasChanged = true;
		}

		if (username) {
			user.username = username;
			hasChanged = true;
		}

		if (password) {
			// 加密密码和salt, TODO： 使用sha1或者bcryptjs
			user.password = password;
			user.passsalt = password;
			hasChanged = true;
		}

		if (!hasChanged) {
			throw new Error('请输入需要修改的相关字段');
		}

		await this._check(newData);
		return this.repository.save(user);
	}

	async delete(id: string): Promise<DeleteResult> {
		const user = await this.repository.findOne(id);

		if (!user) {
			throw new Error('当前用户不存在或已删除')
		}

		return this.repository.delete(id);
	}

	checkRepeat(email: string): Promise<number> {
		return this.repository.count({ email });
	}

	findById(id: string): Promise<User | undefined> {
		// fineOneOrFail 找不到可以报错
		return this.repository.findOne(id);
	}

	findByEmail(email: string): Promise<User | undefined> {
		return this.repository.findOne({ email });
	}

	listWithPaging(page: number, pageSize: number): Promise<User[]> {
		return this.repository.find({
			skip: (page - 1) * pageSize,
			take: Number(pageSize)
		});
	}

	listCount(): Promise<number> {
		return this.repository.count();
	}
}
