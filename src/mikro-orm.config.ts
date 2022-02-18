import {Configuration, Connection, IDatabaseDriver, LoadStrategy, Options} from '@mikro-orm/core'
import path from 'path'
import {Message} from './entities/Message'
import {SendChat} from './entities/SendChat';
import {UserSettings} from './entities/UserSettings';

export default {
	migrations: {
		path: path.join(__dirname, './migrations'),
		pattern: /^[\w-]+\d+\.[tj]s$/,
	},
	entities: [Message, SendChat, UserSettings],
	host: '81.163.26.147',
	port: 5432,
	user: 'root',
	password: 'postgres',
	dbName: 'postgres',
	type: 'postgresql',
	debug: true,
	loadStrategy: LoadStrategy.SELECT_IN,
} as Configuration<IDatabaseDriver<Connection>> | Options<IDatabaseDriver<Connection>> | undefined