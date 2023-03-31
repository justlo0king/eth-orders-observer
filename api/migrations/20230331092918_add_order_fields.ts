import { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', (table) => {
    table.string('allowed_sender',);
    table.text('interactions');
    table.string('maker');
    table.string('maker_asset');
    table.string('offsets');
    table.string('receiver');
    table.string('salt');
    table.string('taker_asset');
    table.string('taking_amount_initial');
    table.string('last_event');
  });
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('allowed_sender');
    table.dropColumn('interactions');
    table.dropColumn('maker');
    table.dropColumn('maker_asset');
    table.dropColumn('offsets');
    table.dropColumn('receiver');
    table.dropColumn('salt');
    table.dropColumn('taker_asset');
    table.dropColumn('taking_amount_initial');
    table.dropColumn('last_event');
  });
}
