import { Migration } from '@mikro-orm/migrations';

export class Migration20220213080436 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "message" add column "photo_id" varchar(255) null;');
  }

}
