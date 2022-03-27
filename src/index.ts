import https from 'https';
import fs from 'fs';
import {EntityManager, IDatabaseDriver, MikroORM} from '@mikro-orm/core';
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql';
import {UserSettings} from './entities/UserSettings';
import {SendChatResolver} from './resolvers/sendChat';
import {UserSettingsResolver} from './resolvers/userSettings';
import {MyContext} from './types';
import mikroConfig from './mikro-orm.config';
import {MessageResolver} from './resolvers/message';
import cors from 'cors';
import TelegramApi from 'node-telegram-bot-api';
import fetch from 'node-fetch';
import {Message} from './entities/Message';

let port = process.env.PORT as any;
if (port == null || port == '') {
	port = 2000;
}

const main = async () => {
	const orm = await MikroORM.init(mikroConfig);
	await orm.getMigrator().up();
	const app = express();
	const TOKEN = process.env.TOKEN;
	const auth_key = process.env.DEEPL_AUTH_KEY;
	const bot = new TelegramApi(TOKEN || '', {polling: true});

	const userSettings = await orm.em.findOne(UserSettings, {id: 1});
	if (!userSettings) {
		const newSettings = orm.em.create(UserSettings, {id: 1, sendImmediately: false});
		await orm.em.persistAndFlush(newSettings);
	}
	bot.setMyCommands([
		{command: '/start', description: 'Приветствие'},
		{command: '/info', description: 'Получить информацию о командах'},
	]);

	bot.on('photo', async (msg) => {
		const {caption, photo} = msg;
		const text = caption;
		const photoObject = photo?.[photo.length - 1];
		if (!photoObject) return;
		const photoId = photoObject.file_id;
		let translatedText = '';

		if (typeof caption === 'string') {
			let responseText: string[] = [];
			const splittedText: string[] = []
			const textRows = (text || '').split('\n');
			textRows.forEach(row => {
				const rowWords = row.split(' ');
				const withoutHashTags: string[] = [];
				rowWords.forEach(w => {
					if (w.startsWith('#')) {
						splittedText.push(w);
					} else {
						withoutHashTags.push(w);
					}
				});
				if (withoutHashTags.length) splittedText.push(withoutHashTags.join(' '));
			});
			await Promise.all(
				splittedText.map(async (text) => {
					if (text.startsWith('#')) {
						responseText.push(text);
						return;
					}
					await fetch(`https://api-free.deepl.com/v2/translate?auth_key=${auth_key}&text=${text}&target_lang=RU`, {
						method: 'POST',
						headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					})
						.then(res => res.json())
						.then(res => {
							res?.translations.map((tr: any) => responseText.push(tr?.text || ''));
						});
				}),
			);
			translatedText = responseText.join('\n');
		}

		try {
			await saveToDB({ru: translatedText, eng: caption, photoId, tgMessageId: msg.message_id});
		} catch (e) {
			console.error('error sendPhoto', e);
		}
	});

	bot.on('text', async (msg) => {
		const {text, chat} = msg;
		const chatId = chat.id;

		let translatedText = '';

		if (typeof text === 'string') {
			let responseText: string[] = [];
			const splittedText: string[] = []
			const textRows = (text || '').split('\n');
			textRows.forEach(row => {
				const rowWords = row.split(' ');
				const withoutHashTags: string[] = [];
				rowWords.forEach(w => {
					if (w.startsWith('#')) {
						splittedText.push(w);
					} else {
						withoutHashTags.push(w);
					}
				});
				if (withoutHashTags.length) splittedText.push(withoutHashTags.join(' '));
			});
			await Promise.all(
				splittedText.map(async (text) => {
					if (text.startsWith('#')) {
						responseText.push(text);
						return;
					}
					await fetch(`https://api-free.deepl.com/v2/translate?auth_key=${auth_key}&text=${text}&target_lang=RU`, {
						method: 'POST',
						headers: {'Content-Type': 'application/x-www-form-urlencoded'},
					})
						.then(res => res.json())
						.then(res => {
							res?.translations.map((tr: any) => responseText.push(tr?.text || ''));
						});
				}),
			);
			translatedText = responseText.join('\n');
		}

		if (text && translatedText) {
			await saveToDB({ru: translatedText, eng: text, tgMessageId: +msg.message_id || 0});
		}

		switch (text) {
			case '/start':
				await bot.sendSticker(chatId, `https://cdn.tlgrm.app/stickers/15d/540/15d540a6-a2f2-3dec-a3d4-5f8bc5df4110/256/1.webp`);
				await bot.sendMessage(chatId, `Добро пожаловать!`);
				break;
			case '/info':
				await bot.sendMessage(chatId, `Вызвана команда /info, еще не доделана`);
				break;
			default:
				await bot.sendMessage(chatId, 'Вы мне написали:\n' + text + `\nПеревод:\n${translatedText}`);
		}
	});
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [MessageResolver, SendChatResolver, UserSettingsResolver],
			validate: true,
		}),
		introspection: true,
		playground: true,
		context: (): MyContext => ({em: orm.em, bot}),
	});
	app.use(cors({
		origin: ['https://web-page-bot.vercel.app', 'https://127.0.0.1', 'https://81.163.26.147', 'http://localhost:3000'],
		credentials: true,
	}));
	apolloServer.applyMiddleware({app, cors: false});
	//
	app.get('/', (_, res) => {
		res.send('hello guys');
	});
	//
	// app.listen(port, () => {
	// 	console.log(`server started on localhost:${port}`);
	// });
	https.createServer({
		key: fs.readFileSync('/etc/ssl/private/private.key'),
		cert: fs.readFileSync('/etc/ssl/certificate.crt'),
	}, app).listen(port, () => {
		console.log(`server started on localhost:${port}`);
	});
	const saveToDB = async (properties: { ru: string | undefined; eng: string | undefined, tgMessageId: number, photoId?: string }) => {
		const ruText = properties.ru;

		const engText = properties.eng;
		const tgMessageId = properties.tgMessageId;
		const photoId = properties.photoId;
		const message = orm.em.create(Message, {ruText, engText, tgMessageId, photoId});
		await orm.em.persistAndFlush(message);
	};

	const setIsSentMessageStatus = async (m: Message, em?: EntityManager<IDatabaseDriver>) => {
		m.isSent = true;
		if (em) {
			await em.persistAndFlush(m);
		} else {
			await orm.em.persistAndFlush(m);
		}
		return true;
	};
//
	const TIMEOUT_DELEY = 1000 * 5;
	const sendLastMessage = async () => {
		const em = orm.em.fork();
		let userSettings: UserSettings | null = null;
		try {
			userSettings = await orm.em.findOne(UserSettings, {id: 1});
		} catch (e) {
			console.log('await userSettings', e);
		}
		const messages = userSettings?.sendImmediately
			? await orm.em.find(Message, {isSent: null})
			: await orm.em.find(Message, {canBeSend: true, isSent: null});
		if (messages.length === 0) {
			console.warn('Сообщений для отправки нет');
			setTimeout(sendLastMessage, 5000);
			return;
		}
		const m = messages[messages.length - 1];

		const chatId = process.env.SEND_CHAT_ID ? +process.env.SEND_CHAT_ID : 0;

		try {
			if (!m.ruText?.trim()) {
				await orm.em.nativeDelete(Message, {id: m.id});
			} else {
				const res = m.photoId
					? await bot.sendPhoto(chatId, m.photoId, {caption: m.ruText || 'Пустое сообщение'})
					: await bot.sendMessage(chatId, m.ruText || 'Пустое сообщение');
				m.tgMessageId = res.message_id;
				await setIsSentMessageStatus(m, em);
			}
		} catch (e) { //
			console.error(e, !m.ruText);
		}

		setTimeout(sendLastMessage, TIMEOUT_DELEY);
	};
	await sendLastMessage();
};

const errorHandler = (e: any) => {
	if (!e) return;
	if (e.errno === -61) setTimeout(() => main().catch(errorHandler), 5000);
	console.log('ERROR _!>', e);
};

main().catch(errorHandler);
