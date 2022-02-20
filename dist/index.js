"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const core_1 = require("@mikro-orm/core");
const express_1 = __importDefault(require("express"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const UserSettings_1 = require("./entities/UserSettings");
const sendChat_1 = require("./resolvers/sendChat");
const userSettings_1 = require("./resolvers/userSettings");
const mikro_orm_config_1 = __importDefault(require("./mikro-orm.config"));
const message_1 = require("./resolvers/message");
const cors_1 = __importDefault(require("cors"));
const node_telegram_bot_api_1 = __importDefault(require("node-telegram-bot-api"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const Message_1 = require("./entities/Message");
let port = process.env.PORT;
if (port == null || port == '') {
    port = 2000;
}
const main = async () => {
    const orm = await core_1.MikroORM.init(mikro_orm_config_1.default);
    await orm.getMigrator().up();
    const app = (0, express_1.default)();
    const TOKEN = process.env.TOKEN;
    console.log('TOKEN -> ', TOKEN);
    if (!TOKEN) {
        setInterval(() => {
            console.log('TOKEN has not', TOKEN);
        });
    }
    const bot = new node_telegram_bot_api_1.default(TOKEN || '', { polling: true });
    const userSettings = await orm.em.findOne(UserSettings_1.UserSettings, { id: 1 });
    if (!userSettings) {
        const newSettings = orm.em.create(UserSettings_1.UserSettings, { id: 1, sendImmediately: false });
        await orm.em.persistAndFlush(newSettings);
    }
    bot.setMyCommands([
        { command: '/start', description: 'Приветствие' },
        { command: '/info', description: 'Получить информацию о командах' },
    ]);
    bot.on('photo', async (msg) => {
        const { caption, photo } = msg;
        const photoObject = photo === null || photo === void 0 ? void 0 : photo[photo.length - 1];
        if (!photoObject)
            return;
        const photoId = photoObject.file_id;
        let ru = '';
        if (typeof caption === 'string') {
            await (0, node_fetch_1.default)('https://libretranslate.de/translate', {
                method: 'POST',
                body: JSON.stringify({
                    q: caption,
                    source: 'ru',
                    target: 'en',
                    format: 'text',
                }),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => res.json())
                .then(res => ru = res.translatedText);
        }
        try {
            await saveToDB({ ru, eng: caption, photoId, tgMessageId: msg.message_id });
        }
        catch (e) {
            console.error('error sendPhoto', e);
        }
    });
    bot.on('text', async (msg) => {
        const { text, chat } = msg;
        const chatId = chat.id;
        let translatedText = '';
        if (typeof text === 'string') {
            await (0, node_fetch_1.default)('https://libretranslate.de/translate', {
                method: 'POST',
                body: JSON.stringify({
                    q: text,
                    source: 'en',
                    target: 'ru',
                    format: 'text',
                }),
                headers: { 'Content-Type': 'application/json' },
            })
                .then(res => res.json())
                .then(res => translatedText = res.translatedText);
        }
        if (text && translatedText) {
            await saveToDB({ ru: translatedText, eng: text, tgMessageId: +msg.message_id || 0 });
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
            resolvers: [message_1.MessageResolver, sendChat_1.SendChatResolver, userSettings_1.UserSettingsResolver],
            validate: true,
        }),
        introspection: true,
        playground: true,
        context: () => ({ em: orm.em, bot }),
    });
    app.use((0, cors_1.default)({
        origin: ['https://web-page-bot.vercel.app', 'https://127.0.0.1', 'https://81.163.26.147'],
        credentials: true,
    }));
    apolloServer.applyMiddleware({ app, cors: false });
    app.get('/', (_, res) => {
        res.send('hello guys');
    });
    https_1.default.createServer({
        key: fs_1.default.readFileSync('/etc/ssl/private/private.key'),
        cert: fs_1.default.readFileSync('/etc/ssl/certificate.crt'),
    }, app).listen(port, () => {
        console.log(`server started on localhost:${port}`);
    });
    const saveToDB = async (properties) => {
        const ruText = properties.ru;
        const engText = properties.eng;
        const tgMessageId = properties.tgMessageId;
        const photoId = properties.photoId;
        const message = orm.em.create(Message_1.Message, { ruText, engText, tgMessageId, photoId });
        await orm.em.persistAndFlush(message);
    };
    const setIsSentMessageStatus = async (m, em) => {
        m.isSent = true;
        if (em) {
            await em.persistAndFlush(m);
        }
        else {
            await orm.em.persistAndFlush(m);
        }
        return true;
    };
    const TIMEOUT_DELEY = 1000 * 5;
    const sendLastMessage = async () => {
        const em = orm.em.fork();
        let userSettings = null;
        try {
            userSettings = await orm.em.findOne(UserSettings_1.UserSettings, { id: 1 });
        }
        catch (e) {
            console.log('await userSettings', e);
        }
        const messages = (userSettings === null || userSettings === void 0 ? void 0 : userSettings.sendImmediately)
            ? await orm.em.find(Message_1.Message, { isSent: null })
            : await orm.em.find(Message_1.Message, { canBeSend: true, isSent: null });
        if (messages.length === 0) {
            console.warn('Сообщений для отправки нет');
            setTimeout(sendLastMessage, 5000);
            return;
        }
        const m = messages[messages.length - 1];
        const chatId = process.env.SEND_CHAT_ID ? +process.env.SEND_CHAT_ID : 0;
        try {
            const res = m.photoId
                ? await bot.sendPhoto(chatId, m.photoId, { caption: m.ruText })
                : await bot.sendMessage(chatId, m.ruText || '');
            m.tgMessageId = res.message_id;
            await setIsSentMessageStatus(m, em);
        }
        catch (e) {
            console.error(e);
        }
        setTimeout(sendLastMessage, TIMEOUT_DELEY);
    };
    await sendLastMessage();
};
const errorHandler = (e) => {
    if (!e)
        return;
    if (e.errno === -61)
        setTimeout(() => main().catch(errorHandler), 5000);
    console.log('ERROR _!>', e);
};
main().catch(errorHandler);
//# sourceMappingURL=index.js.map