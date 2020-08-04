export class Logger {
	
	static log = (value: string): void => {
		console.log('\x1b[37m%s \x1b[2m%s\x1b[0m', '>', value);
	}

	static danger = (value: string): void => {
		console.log('\x1b[31m%s \x1b[31m%s\x1b[0m', '>', value);
	}

	static tip = (value: string): void => {
		console.log('\x1b[36m%s \x1b[36m%s\x1b[0m', '>', value);
	}
}