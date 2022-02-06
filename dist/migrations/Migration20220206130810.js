"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220206130810 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220206130810 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "message" ("id" serial primary key, "tg_message_id" int4 null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "ru_text" text not null, "eng_text" text not null, "can_be_send" bool null, "is_sent" bool null);');
    }
}
exports.Migration20220206130810 = Migration20220206130810;
//# sourceMappingURL=Migration20220206130810.js.map