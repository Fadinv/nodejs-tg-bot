"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220213121149 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220213121149 extends migrations_1.Migration {
    async up() {
        this.addSql('create table "user_settings" ("id" serial primary key, "send_immediately" bool not null);');
    }
}
exports.Migration20220213121149 = Migration20220213121149;
//# sourceMappingURL=Migration20220213121149.js.map