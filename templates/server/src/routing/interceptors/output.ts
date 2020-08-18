import { InterceptorInterface, Action, Interceptor } from 'routing-controllers';
import { ValidationError } from 'class-validator';

/**
 * HTTP_STATUS: 500 不执行此处逻辑
 */
@Interceptor()
export class OutputInterceptor implements InterceptorInterface {
	intercept(action: Action, result: any): string {
		let output: any = Object.create(null);

		if (typeof result === 'object') {
			output.status = result.status || 1;
			result.msg
				? (
					output.msg = result.msg,
					result.data && (output.data = result.data)
				)
				: (output.data = result);
		} else {
			output.status = 0;
			output.msg = result;
		}
		return JSON.stringify(output);
	}
}
