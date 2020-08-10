import { getMongoRepository, MongoRepository, ObjectID } from 'typeorm'
import { Service } from 'typedi'
import { validate, ValidationError } from "class-validator";
import { User } from '../entities'

@Service()
export class UserService {
	repository: MongoRepository<User>

	constructor() {
		this.repository = getMongoRepository(User)
	}

	async newAndSave(body: User): Promise<User> {
		const { email, username, password } = body;
		const user = new User();

		user.email = email;
		user.username = username || (email && email.substr(0, email.indexOf('@')));

		// 加密密码和salt, TODO： 使用sha1或者bcryptjs
		user.password = password;
		user.passsalt = password;

		const errors = await validate(user);
		if (errors.length > 0) {
			throw errors; // ValidationError[]
		}

		return this.repository.save(user);
	}

	checkRepeat(email: string): Promise<number> {
		return this.repository.count({ email });
	}

	findById(id: ObjectID): Promise<User | undefined>  {
		return this.repository.findOne({ id });
	}

	findByEmail(email: string): Promise<User | undefined>  {
		return this.repository.findOne({ email });
	}

	listCount(): Promise<number> {
		return this.repository.count();
	}
}
