"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const message_1 = require("./resolvers/message");
const cors_1 = __importDefault(require("cors"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const Message_1 = require("./entities/Message");
let port = process.env.PORT;
if (port == null || port == '') {
    port = 8000;
}
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    const TOKEN = process.env.TOKEN;
    const bot = new node_telegram_bot_api_1.default(TOKEN || '', { polling: true });
    bot.setMyCommands([
        { command: '/start', description: 'Приветствие' },
        { command: '/info', description: 'Получить информацию о командах' },
    ]);
    bot.on('text', async (msg) => {
        const { text, chat } = msg;
        const chatId = chat.id;
        let translatedText = '';
        if (typeof text === 'string') {
            await (0, node_fetch_1.default)('https://libretranslate.de/translate', {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: 'ru',
                    target: 'en',
                    format: 'text',
                }),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => res.json())
                .then(res => translatedText = res.translatedText);
        }
        if (text && translatedText) {
            await saveToDB({ ru: text, eng: translatedText, tgMessageId: +msg.message_id || 0 });
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
                await bot.sendMessage(chatId, 'Вы мне написали:\n' + text + `\nПеревод:\n${translatedText}` || 'Ничего не понял');
        }
    });
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [message_1.MessageResolver],
            validate: true,
        }),
        introspection: true,
        playground: true,
        context: () => ({ em: orm.em, bot }),
    });
    app.use((0, cors_1.default)({
        origin: 'http://localhost:3000',
        credentials: true,
    }));
    apolloServer.applyMiddleware({ app, cors: false });
    app.get('/', (_, res) => {
        res.send('hello guys');
    });
    app.listen(port, () => {
        console.log(`server started on localhost:${port}`);
    });
    const saveToDB = async (langString) => {
        const ruText = langString.ru;
        const engText = langString.eng;
        const tgMessageId = langString.tgMessageId;
        const message = orm.em.create(Message_1.Message, { ruText, engText, tgMessageId });
        await orm.em.persistAndFlush(message);
    };
    const setIsSentMessageStatus = async (m) => {
        m.isSent = true;
        await orm.em.persistAndFlush(m);
        return true;
    };
    const TIMEOUT_DELEY = 1000 * 60 * 20;
    const sendLastMessage = async () => {
        const messages = await orm.em.find(Message_1.Message, { canBeSend: true, isSent: null });
        if (messages.length === 0) {
            console.warn('Сообщений для отправки нет');
            setTimeout(sendLastMessage, 5000);
            return;
        }
        const m = messages[messages.length - 1];
        const chatId = process.env.SEND_CHAT_ID ? +process.env.SEND_CHAT_ID : 0;
        try {
            const { message_id } = await bot.sendMessage(chatId, m.engText);
            m.tgMessageId = message_id;
            await setIsSentMessageStatus(m);
        }
        catch (e) {
        }
        setTimeout(sendLastMessage, TIMEOUT_DELEY);
    };
    await sendLastMessage();
    setTimeout(sendLastMessage, TIMEOUT_DELEY);
};
main().catch(console.error);
//# sourceMappingURL=index.js.map