// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'

import {
  ordersDataValidator,
  ordersPatchValidator,
  ordersQueryValidator,
  ordersResolver,
  ordersExternalResolver,
  ordersDataResolver,
  ordersPatchResolver,
  ordersQueryResolver
} from './orders.schema'

import type { Application, HookContext } from '../../declarations'
import { OrdersService, getOptions } from './orders.class'
import { ordersPath, ordersMethods } from './orders.shared'

import { OrdersInspector } from '../../modules/orders/orders.module';

export * from './orders.class'
export * from './orders.schema'



// A configure function that registers the service and its hooks via `app.configure`
export const orders = (app: Application) => {

  // Register our service on the Feathers application
  app.use(ordersPath, new OrdersService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: ordersMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })

  let refreshingOrders = false;

  //const ordersModule = initOrdersModule();
  const ordersInspector = new OrdersInspector(app, {});
  ordersInspector.init();
  //ordersInspector.loadTokens().then((data) => console.log(`loaded tokens`));

  // Initialize hooks
  app.service(ordersPath).hooks({
    around: {
      all: [schemaHooks.resolveExternal(ordersExternalResolver), schemaHooks.resolveResult(ordersResolver)]
    },
    before: {
      all: [schemaHooks.validateQuery(ordersQueryValidator), schemaHooks.resolveQuery(ordersQueryResolver)],
      find: [async (hook:HookContext):Promise<HookContext> => {
        const { refresh=false } = hook.params.query;
        if (refresh) {
          // requesting orders from API
          delete hook.params.query.refresh;
          if (refreshingOrders) return hook;      
          refreshingOrders = true;
          //await ordersInspector.loadData();
          refreshingOrders = false;
        }
        return hook;
      }],
      get: [],
      create: [
        schemaHooks.validateData(ordersDataValidator), 
        schemaHooks.resolveData(ordersDataResolver),
        (hook:HookContext): HookContext => {
          if (hook.data) {
            hook.data = {
              ...hook.data,
              created_at: new Date(),
              updated_at: new Date(),
            };
          }
          return hook;
        }
      ],
      patch: [
        schemaHooks.validateData(ordersPatchValidator), 
        schemaHooks.resolveData(ordersPatchResolver),
        (hook:HookContext): HookContext => {
          if (hook.data) {
            hook.data = {
              ...hook.data,
              updated_at: new Date(),
            };
          }
          return hook;
        }        
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  });

  /*
  setTimeout(async () => {
    try {
      await ratesInspector.loadTokens();
      await ratesInspector.loadOrders();
    } catch(error) {
      console.error(`orders: ratesInspector error:`, error);
    }
  }, 3000);
  */
}

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    [ordersPath]: OrdersService
  }
}
