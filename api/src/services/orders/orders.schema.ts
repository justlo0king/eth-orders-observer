// // For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve } from '@feathersjs/schema'
import { Type, getValidator, querySyntax, NumericOptions } from '@feathersjs/typebox'
import type { Static } from '@feathersjs/typebox'

import type { HookContext } from '../../declarations'
import { dataValidator, queryValidator } from '../../validators'

// Main data model schema
export const ordersSchema = Type.Object(
  {
    id: Type.Number(),
    order_hash: Type.String(),
    pair: Type.String(),
    making_amount: Type.String(),
    making_decimals: Type.Number(),
    taking_amount: Type.String(),
    taking_decimals: Type.Number(),
    quoted_amount: Type.String(),
    estimated_gas: Type.String(),
    estimated_gas_taking: Type.String(),
    margin: Type.String(),
    margin_with_gas: Type.String(),
    efficiency: Type.Number(),
    efficiency_with_gas: Type.Number(),
    is_selected: Type.Optional(Type.Boolean()),
    is_active: Type.Boolean(),
    created_at: Type.String(),
    updated_at: Type.String(),
  },
  { $id: 'Orders', additionalProperties: false }
)
export type Orders = Static<typeof ordersSchema>
export const ordersValidator = getValidator(ordersSchema, dataValidator)
export const ordersResolver = resolve<Orders, HookContext>({})

export const ordersExternalResolver = resolve<Orders, HookContext>({})

// Schema for creating new entries
export const ordersDataSchema = Type.Pick(ordersSchema, [
  'order_hash', 'pair', 'making_amount', 'making_decimals', 'taking_amount', 
  'taking_decimals', 'quoted_amount', 'estimated_gas', 'estimated_gas_taking', 
  'margin', 'efficiency', 'efficiency_with_gas',
  'is_selected', 'is_active',
], {
  $id: 'OrdersData'
})
export type OrdersData = Static<typeof ordersDataSchema>
export const ordersDataValidator = getValidator(ordersDataSchema, dataValidator)
export const ordersDataResolver = resolve<Orders, HookContext>({})

// Schema for updating existing entries
export const ordersPatchSchema = Type.Partial(ordersSchema, {
  $id: 'OrdersPatch'
})
export type OrdersPatch = Static<typeof ordersPatchSchema>
export const ordersPatchValidator = getValidator(ordersPatchSchema, dataValidator)
export const ordersPatchResolver = resolve<Orders, HookContext>({})

// Schema for allowed query properties
export const ordersQueryProperties = Type.Pick(ordersSchema, [
  'id', 'order_hash', 'pair', 'is_selected', 'is_active', 'created_at', 'updated_at', 'is_active'
]);
export const ordersQuerySchema = Type.Intersect(
  [
    querySyntax(ordersQueryProperties),
    // Add additional query properties here
    Type.Object({
      is_active: Type.Boolean()
    }, { additionalProperties: true })
  ],
  { additionalProperties: true }
)
export type OrdersQuery = Static<typeof ordersQuerySchema>
export const ordersQueryValidator = getValidator(ordersQuerySchema, queryValidator)
export const ordersQueryResolver = resolve<OrdersQuery, HookContext>({})
