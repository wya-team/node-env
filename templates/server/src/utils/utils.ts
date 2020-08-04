export class Utils {
	/**
	 *  判空
	 * @param value
	 */
	static isEmpty = (value: any): boolean => {
		return value === "" || value === null || value === undefined;
	}

	/**
	 * 生成数组
	 * @param value
	 */
	static toArray = (value: any): any[] => {
		return value ? (Array.isArray(value) ? value : [value]) : [];
	}

	/**
	 * 是否json串
	 * @param value
	 */
	static isJsonString = (value: string) => {
		try {
			if (typeof JSON.parse(value) == "object") {
				return true;
			}
		} catch (e) {} // eslint-disable-line
		return false;
	}
}