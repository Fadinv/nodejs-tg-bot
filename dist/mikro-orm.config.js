"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@mikro-orm/core");
const path_1 = __importDefault(require("path"));
const Message_1 = require("./entities/Message");
exports.default = {
    migrations: {
        path: path_1.default.join(__dirname, './migrations'),
        pattern: /^[\w-]+\d+\.[tj]s$/,
    },
    entities: [Message_1.Message],
    host: 'localhost',
    port: 5432,
    user: 'postgres',
    password: 'postgres',
    dbName: 'postgres',
    type: 'postgresql',
    debug: true,
    loadStrategy: core_1.LoadStrategy.SELECT_IN,
};
//# sourceMappingURL=mikro-orm.config.js.map