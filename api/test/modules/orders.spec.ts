import { OrdersInspector } from '../../src/modules/orders';
jest.mock('axios');

describe(`initOrdersModule`, () => {
  let ordersInspector;
  it(`should init orders module`, () => {
    ordersInspector = new OrdersInspector({} as any, {});
  });
});