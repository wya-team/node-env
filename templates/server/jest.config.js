module.exports = {
	verbose: true,
	preset: 'ts-jest',
	testEnvironment: 'node',
	testRegex: '.*\\.test\\.(j|t)s?$',
	testPathIgnorePatterns: ['<rootDir>/dist/'],
	transformIgnorePatterns: ['<rootDir>/node_modules/'],
	moduleFileExtensions: ['ts', 'js'],
	moduleNameMapper: {
		'tests/(.*)$': '<rootDir>/tests/$1',
		'configs/(.*)$': '<rootDir>/configs/$1',
		'src/(.*)$': '<rootDir>/src/$1'
	},
};
