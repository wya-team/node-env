import { Connection, ConnectionOptions, createConnection, getConnectionOptions } from 'typeorm';

import * as entities from '../entities';
import { Logger } from '.';

export default (async (): Promise<Connection> => {
	try {
		// ormconfig.js
		const connectionOptions: ConnectionOptions = await getConnectionOptions();

		const connection: Connection = await createConnection({
			...connectionOptions,
			// synchronize: true,
			entities: Object.keys(entities).map(name => entities[name]),
		});

		if (connection.isConnected) {
			Logger.log('database connected.');
		} else {
			Logger.danger('Database connection failed.');
		}
		return connection;
	} catch (e) {
		console.error(e, 'db config error');
	}
})();


