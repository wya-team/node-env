import { InterceptorInterface, Action, Interceptor } from 'routing-controllers';
import { ValidationError } from 'class-validator';
/**
 * HTTP_STATUS: 500 不执行此处逻辑
 */
@Interceptor()
export class OutputInterceptor implements InterceptorInterface {
	intercept(action: Action, result: any): string {
		if (typeof result === 'object') {
			return JSON.stringify({
				status: 1,
				msg: 'ok',
				data: result
			});
		}
		return JSON.stringify({
			status: 0,
			msg: result
		});
	}
}
