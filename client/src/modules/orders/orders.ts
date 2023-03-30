import { writable, type Writable } from "svelte/store";
import type { Application } from "../../../types/declarations";
import type { OrdersData } from "../../../types/services/orders/orders.class";

export const ordersStore: Writable<OrdersData[]> = writable([]);
export const selectedOrdersStore: Writable<OrdersData[]> = writable([]);
export const ordersLoadingStore: Writable<boolean> = writable(false);
export const selectedOrdersLoadingStore: Writable<boolean> = writable(false);

let orders: OrdersData[] = [];
ordersStore.subscribe((_orders) => {
  orders = _orders;
});

let selectedOrders: OrdersData[] = [];
selectedOrdersStore.subscribe((_selectedOrders) => {
  selectedOrders = _selectedOrders;
});


export function initOrders(client: Application) {
  const ordersService = client.service('orders')

  ordersService.on('created', (orderData: OrdersData) => {
    if (orderData.is_selected === true) {
      console.log(`adding order to selected:`, orderData);
      selectedOrdersStore.set([
        orderData,
        ...selectedOrders,
      ].slice(0, 5));
    }

    ordersStore.set([
      orderData,
      ...orders,
    ]);
  });

  ordersService.on('patched', (orderData: OrdersData) => {
    if (!orderData.is_active) {
      const ordersFiltered = orders.filter((order) => order.id != orderData.id);
      if (ordersFiltered.length != orders.length) {
        ordersStore.set(ordersFiltered);
      }
    }
  });

  ordersService.on('removed', (orderData: OrdersData) => {
    const ordersFiltered = orders.filter((order) => order.id != orderData.id);
    if (ordersFiltered.length != orders.length) {
      ordersStore.set(ordersFiltered);
    }
    const selectedOrdersFiltered = orders.filter((order) => order.id != orderData.id);
    if (selectedOrdersFiltered.length != selectedOrders.length) {
      selectedOrdersStore.set(selectedOrdersFiltered);
    }
  });

  return ordersService;
}
