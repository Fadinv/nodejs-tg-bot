"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Migration20220213080436 = void 0;
const migrations_1 = require("@mikro-orm/migrations");
class Migration20220213080436 extends migrations_1.Migration {
    async up() {
        this.addSql('alter table "message" add column "photo_id" varchar(255) null;');
    }
}
exports.Migration20220213080436 = Migration20220213080436;
//# sourceMappingURL=Migration20220213080436.js.map