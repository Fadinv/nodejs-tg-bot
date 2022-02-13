"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220213095532 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220213095532 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "send_chat" ("id" serial primary key, "tg_chat_id" varchar(255) not null, "listen" bool not null);');
    }
}
exports.Migration20220213095532 = Migration20220213095532;
//# sourceMappingURL=Migration20220213095532.js.map