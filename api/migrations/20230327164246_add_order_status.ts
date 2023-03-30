import { Knex } from "knex";


// 1 - valid limit orders, 
// 2 - temporary invalid limit orders,
// 3 - invalid limit orders
export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', (table) => {
    table.enum('status', ['active', 'archived']);
  })
}


export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('orders', (table) => {
    table.dropColumn('status');
  })
}

