import { RegEx } from '@utils/utils';
import __tpl__ from './__tpl__';
import _common from './_common';
import login from './login';
import home from './home';

const API = {
	...__tpl__,
	..._common,
	...login,
	...home
};

let baseUrl;

/* global __DEV__ */
if (__DEV__) {
	baseUrl = `${typeof location != 'undefined' && location.origin}`;
} else {
	// 生产环境
	baseUrl = `${typeof location != 'undefined' && location.origin}`;
}
for (let i in API) {
	if (RegEx.URLScheme.test(API[i])) {
		// API[i] = API[i];
	} else {
		API[i] = baseUrl + API[i];
	}
}
export default API;
