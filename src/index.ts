import {MikroORM} from '@mikro-orm/core'
import express from 'express'
import {ApolloServer} from 'apollo-server-express'
import {buildSchema} from 'type-graphql'
import {MyContext} from './types'
import mikroConfig from './mikro-orm.config'
import {MessageResolver} from './resolvers/message'
import cors from 'cors'
import TelegramApi from 'node-telegram-bot-api'
import fetch from 'node-fetch'
import {Message} from './entities/Message'

let port = process.env.PORT as any
if (port == null || port == '') {
	port = 8000
}

const main = async () => {
	const orm = await MikroORM.init(mikroConfig)
	await orm.getMigrator().up()
	const app = express()
	const TOKEN = process.env.TOKEN
	const bot = new TelegramApi(TOKEN || '', {polling: true})
	bot.setMyCommands([
		{command: '/start', description: 'Приветствие'},
		{command: '/info', description: 'Получить информацию о командах'},
	])

	bot.on('text', async (msg) => {
		const {text, chat} = msg
		const chatId = chat.id

		let translatedText = ''

		if (typeof text === 'string') {
			await fetch('https://libretranslate.de/translate', {
				method: 'POST',
				body: JSON.stringify({
					q: text,
					source: 'ru',
					target: 'en',
					format: 'text',
				}),
				headers: {'Content-Type': 'application/json'},
			})
				.then(res => res.json())
				.then(res => translatedText = res.translatedText)
		}

		if (text && translatedText) {
			await saveToDB({ru: text, eng: translatedText, tgMessageId: +msg.message_id || 0})
		}

		switch (text) {
			case '/start':
				await bot.sendSticker(chatId, `https://cdn.tlgrm.app/stickers/15d/540/15d540a6-a2f2-3dec-a3d4-5f8bc5df4110/256/1.webp`)
				await bot.sendMessage(chatId, `Добро пожаловать!`)
				break
			case '/info':
				await bot.sendMessage(chatId, `Вызвана команда /info, еще не доделана`)
				break
			default:
				await bot.sendMessage(chatId, 'Вы мне написали:\n' + text + `\nПеревод:\n${translatedText}` || 'Ничего не понял')
		}
	})
	const apolloServer = new ApolloServer({
		schema: await buildSchema({
			resolvers: [MessageResolver],
			validate: true,
		}),
		introspection: true,
		playground: true,
		context: (): MyContext => ({em: orm.em, bot}),
	})
	app.use(cors({
		origin: 'http://localhost:3000',
		credentials: true,
	}))
	apolloServer.applyMiddleware({app, cors: false})
	//
	app.get('/', (_, res) => {
		res.send('hello guys')
	})
	//
	app.listen(port, () => {
		console.log(`server started on localhost:${port}`)
	})
	//
	// bot api
	//
	const saveToDB = async (langString: { ru: string; eng: string, tgMessageId: number }) => {
		const ruText = langString.ru
		const engText = langString.eng
		const tgMessageId = langString.tgMessageId
		const message = orm.em.create(Message, {ruText, engText, tgMessageId})
		await orm.em.persistAndFlush(message)
	}

	const setIsSentMessageStatus = async (m: Message) => {
		m.isSent = true
		await orm.em.persistAndFlush(m)
		return true
	}
//
	const TIMEOUT_DELEY = 1000 * 60 * 20
	const sendLastMessage = async () => {
		const messages = await orm.em.find(Message, {canBeSend: true, isSent: null})
		if (messages.length === 0) {
			console.warn('Сообщений для отправки нет')
			setTimeout(sendLastMessage, 5000)
			return;
		}
		const m = messages[messages.length - 1]

		const chatId = process.env.SEND_CHAT_ID ? +process.env.SEND_CHAT_ID : 0

		try {
			const {message_id} = await bot.sendMessage(chatId, m.engText)
			m.tgMessageId = message_id
			await setIsSentMessageStatus(m)
		} catch (e) { //
		}

		setTimeout(sendLastMessage, TIMEOUT_DELEY)
	}
	await sendLastMessage()
	setTimeout(sendLastMessage, TIMEOUT_DELEY)
}

main().catch(console.error)