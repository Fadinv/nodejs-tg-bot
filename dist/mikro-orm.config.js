"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const path_1 = __importDefault(require("path"));
const Message_1 = require("./entities/Message");
const SendChat_1 = require("./entities/SendChat");
const UserSettings_1 = require("./entities/UserSettings");
exports.default = {
    migrations: {
        path: path_1.default.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Message_1.Message, SendChat_1.SendChat, UserSettings_1.UserSettings],
    host: '127.0.0.1',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    dbName: 'postgres',
    type: 'postgresql',
    debug: true,
    loadStrategy: core_1.LoadStrategy.SELECT_IN,
};
//# sourceMappingURL=mikro-orm.config.js.map