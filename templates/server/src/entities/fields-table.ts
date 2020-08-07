interface Person {
	[propName: string]: string[];
}
/**
 * 针对模型，筛选出给用户的数据，字段表
 */
const FIELDS_TABEL: Person = {
	user: ['id', 'email', 'username']
};

export default FIELDS_TABEL;
