import { NetworkEnum, OneInchApi } from '../../src/modules/1inch/1inch.wsclient';
import EventEmitter from 'events';
import axios from 'axios';

import sampleFusionTokensEth from '../data/1inch/tokens_eth.json';
import sampleOrdersData from '../data/1inch/active_orders.json';

const SEND_REQUESTS = process.env.SEND_REQUESTS || false;
if (!SEND_REQUESTS) {
  jest.mock('axios');
}

const initWsMock = jest.fn();
const getActiveOrdersMock = jest.fn();
const onGetActiveOrdersMock = jest.fn();
class WebSocketApiMock extends EventEmitter {
  init() {
    initWsMock();
  }
  get rpc() {
    return {
      onGetActiveOrders: (listener:any) => {
        this.on('getActiveOrders', listener);
      },
      getActiveOrders: getActiveOrdersMock,
    }
  }
  get order() {
    return {
      onOrder: (listener:any) => {
        this.on('order', listener);
      },
    }
  }
}
const mockedApi = new WebSocketApiMock();

jest.mock('@1inch/fusion-sdk', () => {
  return {
    NetworkEnum: { ETHEREUM: 1 },
    WebSocketApi: jest.fn().mockImplementation(() => {
      return mockedApi;
    })
  };
});


describe(`OneInchWsClient`, () => {
  let client:OneInchApi;
  it(`should init client`, () => {
    client = new OneInchApi();
    client.init();
    expect(initWsMock).toBeCalledTimes(1);
  });
  it(`should emit connection events`, () => {
    const onError = jest.fn();
    const onClose = jest.fn();
    const onOpen = jest.fn();
    client.on('error', onError);
    client.on('open', onOpen);
    client.on('close', onClose);
    mockedApi.emit('open', { payload: true });
    mockedApi.emit('close', { payload: true });
    mockedApi.emit('error', { payload: true });
    expect(onOpen).toBeCalledTimes(1);
    expect(onClose).toBeCalledTimes(1);
    expect(onError).toBeCalledTimes(1);
  });
  it(`should emit order event`, () => {
    const onEvent = jest.fn();
    client.on('order', onEvent);
    mockedApi.emit('order', { payload: true });
    expect(onEvent).toBeCalledTimes(1);
  });

  it(`should collect token addresses`, async () => {
    if (!SEND_REQUESTS) {
      axios.get = jest.fn().mockResolvedValueOnce({
        data: sampleFusionTokensEth
      });
    }
    await client.loadTokens();
    expect(Object.keys(client.tokensByAddress).length).toBeGreaterThan(0);
    if (!SEND_REQUESTS) expect(axios.get).toBeCalledTimes(1);
  });

  it(`should request new orders`, () => {
    client.loadOrders();
    expect(getActiveOrdersMock).toBeCalledTimes(1);
  });

  it(`should emit getActiveOrders event`, () => {
    const onEvent = jest.fn();
    client.on('getActiveOrders', onEvent);
    mockedApi.emit('getActiveOrders', sampleOrdersData);
    expect(onEvent).toBeCalledTimes(1);
  });

});