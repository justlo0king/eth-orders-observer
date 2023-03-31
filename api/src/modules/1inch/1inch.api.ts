import EventEmitter from 'events';
import {
  WebSocketApi, NetworkEnum, AuctionCalculator, LimitOrderV3Struct
} from '@1inch/fusion-sdk';
import { ActiveOrder } from '@1inch/fusion-sdk/api/orders'
import { PaginationOutput } from '@1inch/fusion-sdk/api/types';
import { OrderEventType, Event } from '@1inch/fusion-sdk/ws-api/types';
import axios, { AxiosResponse } from 'axios';

export { NetworkEnum, ActiveOrder, Event, OrderEventType };

export type OneInchToken = {
  symbol: string;
  name: string;
  decimals: number;
  address: string;
  logoURI: string;
  tags: string[];
}


export type OneInchOrdersResponse = {
  items: ActiveOrder[],
  meta: {
    totalItems: number;
    currentPage: number;
    itemsPerPage: number;
    totalPages: number;
  }
}


export interface OneInchApiConfig {
  url?: string;
  urlAggregation?: string;
  network?: NetworkEnum;
}

export class OneInchApi extends EventEmitter {
  private ws:WebSocketApi;
  private uriWebsocket = 'wss://fusion.1inch.io/ws';
  private uriAggregation = 'https://api.1inch.io/v5.0';
  constructor() {
    super();    
    this.ws = new WebSocketApi({
      url: this.uriWebsocket,
      network: NetworkEnum.ETHEREUM,
      lazyInit: true
    });
  }

  init() {
    this.ws.init();
    this.ws.on('open', () => {
      this.emit('open');
    });
    this.ws.on('error', (error) => {
      this.emit('error', error);
    });
    this.ws.on('close', () => {
      this.emit('close');
    });

    this.ws.order.onOrder((data) => {
      this.emit('order', data);
    });
    
    this.ws.rpc.onGetActiveOrders((data: PaginationOutput<ActiveOrder>) => {
      this.emit('getActiveOrders', data);
    });
  }

  public loadOrders() {
    this.ws.rpc.getActiveOrders();
  }

  public async loadTokens(network:NetworkEnum=NetworkEnum.ETHEREUM) {
    const requestUri = `${this.uriAggregation}/${network}/tokens`;
    const result: AxiosResponse = await axios.get(requestUri);
    const { tokens = {} } = result?.data || {};
    Object.keys(tokens).forEach((address) => {
      this._tokensByAddress[address] = tokens[address];
    });
  }  

  private _tokensByAddress: Record<string, OneInchToken> = {};
  get tokensByAddress() {
    return this._tokensByAddress;
  }

  public recalculate(order:LimitOrderV3Struct) {
    const calculator = AuctionCalculator.fromLimitOrderV3Struct(order);
    const rate = calculator.calcRateBump(Math.round(Date.now()/1000));    
    const auctionTakingAmount = calculator.calcAuctionTakingAmount(
      order.takingAmount,
      rate
    );
    return auctionTakingAmount;
  }
}