import io from 'socket.io-client'
import { feathers } from '@feathersjs/feathers'
import socketio from '@feathersjs/socketio-client'
import {
  initOrders,
  ordersStore,
  selectedOrdersStore,
} from '../orders/orders';
import type { Writable } from 'svelte/store';

export function createClient(params:any={}) {
  const socket = io(params.apiUrl || 'http://localhost:3030/', {
    transports: ['websocket']
  });
  const client = feathers();

  const loadOrders = async (store:Writable<unknown>, query={}) => {
    const orders = await client.service('orders').find({
      query
    });
    if (orders?.data) {
      store.set(orders.data);
    }
  }

  client.configure(socketio(socket));
  socket.on('connect', async () => {
    await Promise.all([
      loadOrders(ordersStore, { is_active: true, $limit: 100, $sort: { created_at: -1 }}),
      loadOrders(selectedOrdersStore, { is_selected: true, $limit: 5, $sort: { created_at: -1 }}),
    ]);
  });
  socket.on('error', (error) => {
    console.error(`apiClient: connection error:`, error);
  })

  const ordersService = initOrders(client);
}