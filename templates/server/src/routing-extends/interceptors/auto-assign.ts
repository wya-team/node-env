import { InterceptorInterface, Action, Interceptor } from 'routing-controllers';

@Interceptor()
export class AutoAssignInterceptor implements InterceptorInterface {
	intercept(action: Action, result: any): string {
		if (typeof result === 'object') {
			return JSON.stringify({ ...result, msg: 'ok', status: 1 });
		}
		return JSON.stringify({ status: 0, msg: result });
	}
}
