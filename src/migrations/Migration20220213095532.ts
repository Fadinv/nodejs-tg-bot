import { Migration } from '@mikro-orm/migrations';

export class Migration20220213095532 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "send_chat" ("id" serial primary key, "tg_chat_id" varchar(255) not null, "listen" bool not null);');
  }

}
