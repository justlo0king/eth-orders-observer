import type { Params } from '@feathersjs/feathers';
import type { ClientApplication } from '../../client';
import type { Orders, OrdersData, OrdersPatch, OrdersQuery, OrdersService } from './orders.class';
export type { Orders, OrdersData, OrdersPatch, OrdersQuery };
export type OrdersClientService = Pick<OrdersService<Params<OrdersQuery>>, (typeof ordersMethods)[number]>;
export declare const ordersPath = "orders";
export declare const ordersMethods: readonly ["find", "get", "create", "patch", "remove"];
export declare const ordersClient: (client: ClientApplication) => void;
declare module '../../client' {
    interface ServiceTypes {
        [ordersPath]: OrdersClientService;
    }
}
