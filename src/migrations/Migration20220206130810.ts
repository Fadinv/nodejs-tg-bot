import { Migration } from '@mikro-orm/migrations';

export class Migration20220206130810 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "message" ("id" serial primary key, "tg_message_id" int4 null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, "ru_text" text not null, "eng_text" text not null, "can_be_send" bool null, "is_sent" bool null);');
  }

}
