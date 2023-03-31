import { writable, type Writable } from "svelte/store";
import type { Application } from "../../../types/declarations";
import type { OrdersData } from "../../../types/services/orders/orders.class";
import { client } from '../apiclient/api.client';

export const ordersStore: Writable<OrdersData[]> = writable([]);
export const selectedOrdersStore: Writable<OrdersData[]> = writable([]);
export const ordersLoadingStore: Writable<boolean> = writable(false);
export const selectedOrdersLoadingStore: Writable<boolean> = writable(false);

let orders: OrdersData[] = [];
ordersStore.subscribe((_orders) => {
  orders = _orders;
});

let ordersTotal: number = 0;
export const ordersTotalStore = writable(0);
ordersTotalStore.subscribe((value) => {
  ordersTotal = value;
});


let selectedOrders: OrdersData[] = [];
selectedOrdersStore.subscribe((_selectedOrders) => {
  selectedOrders = _selectedOrders;
});

let selectedOrdersTotal: number = 0;
export const selectedOrdersTotalStore = writable(0);
selectedOrdersTotalStore.subscribe((value) => {
  selectedOrdersTotal = value;
});


export const loadOrders = async (store:Writable<unknown>, totalStore:Writable<number>, query={}) => {
  const orders = await client.service('orders').find({
    query
  });
  if (orders?.data) {
    store.set(orders.data);
  }
  console.log(`orders: total: ${orders.total}, skip: ${orders.skip}`);
  if (orders.total !== undefined) {
    totalStore.set(orders.total);
  }
  return orders;
}

export function initOrders(client: Application) {
  const ordersService = client.service('orders')

  const orderCreated = (orderData: OrdersData) => {
    if (orderData.is_selected === true) {
      selectedOrdersStore.set([
        orderData,
        ...selectedOrders,
      ].slice(0, 5));
    }

    ordersStore.set([
      orderData,
      ...orders,
    ]);
  };


  const orderPatched = (orderData: OrdersData) => {
    let selectedOrderIndex = -1;
    let selectedRemoved = false;

    if (!orderData.is_active) {
      // removing order from active
      const ordersFiltered = orders.filter((order) => order.id != orderData.id);
      if (ordersFiltered.length != orders.length) {
        ordersStore.set(ordersFiltered);
      }
      selectedOrderIndex = selectedOrders.findIndex((order) => order.id == orderData.id);
      if (selectedOrderIndex != -1) {
        if (orderData.is_selected) {
          // updating data
          selectedOrders[selectedOrderIndex] = orderData;
        } else {
          // not selected anymore, removing
          selectedOrders.splice(selectedOrderIndex, 1);
          selectedRemoved = true;
        }
        selectedOrdersStore.set(selectedOrders);
      }
    } else {
      // updating list of selected orders
      selectedOrderIndex = selectedOrders.findIndex((order) => order.id == orderData.id);
      if (selectedOrderIndex != -1) {
        if (orderData.is_selected) {
          // updating data
          selectedOrders[selectedOrderIndex] = orderData;
        } else {
          // not selected anymore, removing
          selectedOrders.splice(selectedOrderIndex, 1);
          selectedRemoved = true;
        }
        selectedOrdersStore.set(selectedOrders);
      }

      // updating list of active orders
      const orderIndex = orders.findIndex((order) => order.id == orderData.id);
      if (orderIndex != -1) {
        orders[orderIndex] = orderData;
        ordersStore.set(orders);
      } else {
        if (selectedRemoved) {
          orders.push(orderData);
          orders.sort((a, b) => { if (a.created_at > b.created_at) { return -1; } else if (b > a) { return 1; } else { return 0 }; })
          ordersStore.set(orders);
        }
      }
    }
  };

  const orderRemoved = (orderData: OrdersData) => {
    const ordersFiltered = orders.filter((order) => order.id != orderData.id);
    if (ordersFiltered.length != orders.length) {
      ordersStore.set(ordersFiltered);
    }
    const selectedOrdersFiltered = orders.filter((order) => order.id != orderData.id);
    if (selectedOrdersFiltered.length != selectedOrders.length) {
      selectedOrdersStore.set(selectedOrdersFiltered);
    }
  };

  ordersService.on('created', orderCreated);
  ordersService.on('patched', orderPatched);
  ordersService.on('removed', orderRemoved);
  return ordersService;
}
