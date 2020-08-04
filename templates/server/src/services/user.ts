import { getMongoRepository, MongoRepository } from 'typeorm'
import { Service } from 'typedi'
import { User } from '../entities'

interface ReqBody {
	email?: string;
	username?: string;
	password?: string;
}

@Service()
export class UserService {
	repository: MongoRepository<User>

	constructor() {
		this.repository = getMongoRepository(User)
	}

	newAndSave(body: ReqBody): Promise<User | void> {
		const user = new User();
		user.email = body.email;

		// TODO: 修复错误数据
		return this.repository.save(user).catch((e) => console.log(e));
	}
}
