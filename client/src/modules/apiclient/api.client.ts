import io from 'socket.io-client'
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import {
  initOrders,
  ordersStore,
  ordersTotalStore,
  selectedOrdersStore,
  selectedOrdersTotalStore,
} from '../orders/orders';
import type { Writable } from 'svelte/store';
import type { Application } from '../../../types/declarations';
import { loadOrders } from '../orders/orders';
export let client: Application;

export function createClient(params:any={}) {
  const socket = io(params.apiUrl || 'http://localhost:3030/', {
    transports: ['websocket']
  });
  client = feathers();

  client.configure(socketio(socket));
  socket.on('connect', async () => {
    await Promise.all([
      loadOrders(ordersStore, ordersTotalStore, {
        is_active: true, $limit: 100, $sort: { created_at: -1
      }}),
      loadOrders(selectedOrdersStore, selectedOrdersTotalStore, {
        is_selected: true, $limit: 5, $sort: { created_at: -1 }
      }),
    ]);
  });
  socket.on('error', (error) => {
    console.error(`apiClient: connection error:`, error);
  })

  const ordersService = initOrders(client);
}