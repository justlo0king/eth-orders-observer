// For more information about this file see https://dove.feathersjs.com/guides/cli/service.shared.html
import type { Params } from '@feathersjs/feathers'
import type { ClientApplication } from '../../client'
import type { Orders, OrdersData, OrdersPatch, OrdersQuery, OrdersService } from './orders.class'

export type { Orders, OrdersData, OrdersPatch, OrdersQuery }

export type OrdersClientService = Pick<OrdersService<Params<OrdersQuery>>, (typeof ordersMethods)[number]>

export const ordersPath = 'orders'

export const ordersMethods = ['find', 'get', 'create', 'patch', 'remove'] as const

export const ordersClient = (client: ClientApplication) => {
  const connection = client.get('connection')

  client.use(ordersPath, connection.service(ordersPath), {
    methods: ordersMethods
  })
}

// Add this service to the client service type index
declare module '../../client' {
  interface ServiceTypes {
    [ordersPath]: OrdersClientService
  }
}
