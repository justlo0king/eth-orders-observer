import type { Params } from '@feathersjs/feathers';
import { KnexService } from '@feathersjs/knex';
import type { KnexAdapterParams, KnexAdapterOptions } from '@feathersjs/knex';
import type { Application } from '../../declarations';
import type { Orders, OrdersData, OrdersPatch, OrdersQuery } from './orders.schema';
export type { Orders, OrdersData, OrdersPatch, OrdersQuery };
export interface OrdersParams extends KnexAdapterParams<OrdersQuery> {
}
export declare class OrdersService<ServiceParams extends Params = OrdersParams> extends KnexService<Orders, OrdersData, OrdersParams, OrdersPatch> {
}
export declare const getOptions: (app: Application) => KnexAdapterOptions;
