module.exports = {
	bail: true,
	verbose: false,
	testEnvironment: 'node',
	testRegex: '.*\\.test\\.(j|t)s?$',
	transform: {
		'^.+\\.[t|j]s?$': ['ts-jest'],
	},
	transformIgnorePatterns: ['<rootDir>/node_modules/'],
	moduleNameMapper: {
		'tests/(.*)$': '<rootDir>/tests/$1',
		'configs/(.*)$': '<rootDir>/configs/$1',
		'src/(.*)$': '<rootDir>/src/$1',
		// server: '<rootDir>/app.ts',
		// app: '<rootDir>/app.ts',
	},
};
