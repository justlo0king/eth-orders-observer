// For more information about this file see https://dove.feathersjs.com/guides/cli/knexfile.html
import type { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('orders', (table) => {
    table.increments('id').primary();
    table.string('order_hash', 66);
    table.string('pair', 24);
    table.string('making_amount', 256);
    table.smallint('making_decimals');
    table.string('taking_amount', 256);
    table.smallint('taking_decimals');
    table.string('quoted_amount', 256);
    table.string('estimated_gas', 256);
    table.string('estimated_gas_taking', 256);
    table.string('margin', 256);
    table.float('efficiency');
    table.float('efficiency_with_gas');
    table.boolean('is_selected');
    table.boolean('is_active');
    table.datetime('created_at');
    table.datetime('updated_at');

    table.unique(['order_hash']);
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable('orders')
}
