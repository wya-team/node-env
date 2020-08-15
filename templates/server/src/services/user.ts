import { getMongoRepository, MongoRepository, ObjectID, ObjectIdColumn } from 'typeorm';
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

	async create(body: User): Promise<User> {
		const { email, username, password } = body;
		const user = new User();

		user.email = email;
		user.username = username || (email && email.substr(0, email.indexOf('@')));

		// 加密密码和salt, TODO： 使用sha1或者bcryptjs
		user.password = password;
		user.passsalt = password;

		await this._check(user);
		return this.repository.save(user);
	}

	async update(newData: User): Promise<User> {
		await this._check(newData);
		return this.repository.save(newData);
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
