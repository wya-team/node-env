import { getMongoRepository, MongoRepository } from 'typeorm'
import { Service } from 'typedi'
import { validate, ValidationError } from "class-validator";
import { User } from '../entities'

@Service()
export class UserService {
	repository: MongoRepository<User>

	constructor() {
		this.repository = getMongoRepository(User)
	}

	async newAndSave(body: User): Promise<User | ValidationError[]> {
		const { email, username, password } = body;
		const user = new User();

		user.email = email;
		user.username = username || email.substr(0, email.indexOf('@'));

		// 加密密码和salt, TODO： 使用sha1或者bcryptjs
		user.password = password;
		user.passsalt = password;

		const errors = await validate(user);
		if (errors.length > 0) {
			throw errors;
		}

		return this.repository.save(user);
	}
}
