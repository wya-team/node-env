let db = connect("mongodb://mongo-admin:123456@127.0.0.1:27017/admin");

db
	.getSiblingDB('repo')
	.createUser(
		{
			user: "repo-admin",
			pwd: "123456",
			roles: [{ role: "readWrite", db: "repo" }]
		}
	);

db	
	.getSiblingDB('test-repo')
	.createUser(
		{
			user: "test-repo-admin",
			pwd: "123456",
			roles: [{ role: "readWrite", db: "test-repo" }]
		}
	);