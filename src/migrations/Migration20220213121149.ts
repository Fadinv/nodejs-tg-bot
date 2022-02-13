import { Migration } from '@mikro-orm/migrations';

export class Migration20220213121149 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user_settings" ("id" serial primary key, "send_immediately" bool not null);');
  }

}
