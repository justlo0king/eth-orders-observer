import EventEmitter from 'events';
import { Application } from '../../declarations';
import { OneInchOrdersResponse, OneInchApi, ActiveOrder, OneInchToken } from '../1inch/1inch.wsclient';
import { OpenOceanClient } from '../openocean/client';

const EFFICIENCY_THRESHOLD = process.env.EFFICIENCY_THRESHOLD ?? 10;

export class OrdersInspector extends EventEmitter {
  private app: Application;
  private params: Record<string, unknown>;
  private oneInch: OneInchApi;
  private openOcean: OpenOceanClient;
  constructor(app: Application, params:any={}) {
    super();
    this.app = app;
    this.params = params;
    this.oneInch = new OneInchApi();
    this.openOcean = new OpenOceanClient();
  }

  public init() {
    this.oneInch.init();
    this.oneInch.on('getActiveOrders', async (data:OneInchOrdersResponse) => {
      console.log(`orders.init: active orders:`, data);
      const { items } = data;
      const promises: Promise<void>[] = items.map((orderData) => {
        return this.onOrderCreated(orderData);
      });
      try {
        await Promise.all(promises);
      } catch(error) {
        console.error(`orders.init: onActiveOrder error:`, error);
      }
    });

    this.oneInch.on('order', async (data:any) => {
      const { event, result } = data;
      console.log(`orders.init: order event: ${event}, result:`, result);
      switch(event) {
        case 'order_created':
          return this.onOrderCreated(result);
        case 'order_filled':
        case 'order_filled_partially':
        case 'order_invalid':
        case 'order_balance_or_allowance_change':
          return this.removeIfNotSelected(result.orderHash);
      }
    });
    this.oneInch.on('error', (error) => {
      console.error(`oneInch error:`, error);
    });

    // requesting coin addresses
    setTimeout(async() => {
      await this.loadTokens();
      this.loadOrders();
    }, 1000);
  }

  /**
   * requests to update list of coin addresses
   * @param context Enum<'orders'|'rates'>
   * @returns 
   */
  public async loadTokens(context?:'orders'|'rates'):Promise<void> {
    const promises: Promise<void>[] = [];
    if (context === 'orders' || !context) {
      promises.push(this.oneInch.loadTokens());
    } 
    if (context === 'rates' || !context) {
      promises.push(this.openOcean.requestTokens('eth'));
    }
  
    try {
      await Promise.all(promises);
      console.log(`tokens loaded`);
    } catch(error) {
      this.emit('error', { code: 502, message: 'failed to load tokens', context });
      console.error(`OrdersInspector.loadTokens: failed to load tokens, error:`, error);
    }
  }

  public loadOrders() {
    this.oneInch.loadOrders();
  }

  /**
   * requests quote for exchange
   * @param pairs object as <pair => amount>, like { 'ETH-BTC': 0.05 }
   * @returns object as <pair => { inAmount, outAmount, estimatedGas }>
   */
  private async getQuote(pairs:Record<string, number>):Promise<Record<string, Record<string, string|number>>> {
    const results: Record<string, Record<string, string|number>> = {};
    const promises: Promise<unknown>[] = Object.keys(pairs).map(async (pair) => {
      const [ makerSymbol, takerSymbol ] = pair.split('-');
      const amount = pairs[pair];
      const { data: { inAmount, outAmount, estimatedGas }} = await this.openOcean.quote(makerSymbol, takerSymbol, amount);
      results[pair] = { inAmount, outAmount, estimatedGas };
    });
    await Promise.all(promises);
    console.log(`orders.getQuote: results:`, results);
    return results;
  }

  /**
   * makes amount decimal number
   * @param amount string
   * @param decimals number
   * @returns number
   */
  private amountDecimal(amount:string, decimals: number) {
    return Number(amount) * Math.pow(10, -1 * decimals)
  }
  
  /**
   * works on newly arrived orders
   * @param data ActiveOrder
   * @returns void
   */
  private async onOrderCreated(data:ActiveOrder): Promise<void> {
    const { 
      orderHash, 
      order: { makerAsset, takerAsset, makingAmount, takingAmount }
    } = data;

    const makerToken = this.oneInch.tokensByAddress[makerAsset];
    const takerToken = this.oneInch.tokensByAddress[takerAsset];

    if (!makerToken || !takerToken) {
      console.log(`onOrderCreated: order skipped due to no token`);
      return;
    }

    const pair = `${makerToken.symbol}-${takerToken.symbol}`;
    const quotesByPair = await this.makeQuotes(data, makerToken, takerToken);
    
    const { outAmount, estimatedGas } = quotesByPair && quotesByPair[pair] || {};
    if (!outAmount || !estimatedGas) {
      console.error(`orders.onOrderCreated: quote error`);
      return;
    }

    let { outAmount:gasPrice } = quotesByPair && quotesByPair[`ETH-${takerToken.symbol}`] || {};
    if (takerToken.symbol == 'ETH') {
      // compared with 1 million gwei
      gasPrice = 1000000;
    }
    const gasCost = Number(estimatedGas) / 1000000 * Number(gasPrice);
    const gasCostNum = Number(gasCost) * Math.pow(10, -1*takerToken.decimals);
    const takingAmountNum = Number(takingAmount) * Math.pow(10, -1*takerToken.decimals);
    const outAmountNum = Number(outAmount) * Math.pow(10, -1 * takerToken.decimals);
    const margin = (outAmountNum - takingAmountNum) * Math.pow(10, takerToken.decimals);
    const efficiency = Math.round((outAmountNum - takingAmountNum) / takingAmountNum * 100 * 100) / 100;
    const efficiencyWithGas = Math.round((outAmountNum - takingAmountNum - gasCostNum) / takingAmountNum * 100 * 100) / 100;
    const is_selected = Boolean(efficiencyWithGas > EFFICIENCY_THRESHOLD);
    
    await this.app.service('orders').create({
      order_hash: orderHash,
      pair,
      making_amount: String(makingAmount),
      making_decimals: makerToken.decimals,
      taking_amount: String(takingAmount),
      taking_decimals: takerToken.decimals,
      quoted_amount: String(outAmount),
      estimated_gas: String(estimatedGas),
      estimated_gas_taking: String(gasCost),
      efficiency: efficiency,
      efficiency_with_gas: efficiencyWithGas,
      margin: String(margin),
      is_selected,
      is_active: true,
    });
  }

  /**
   * makes quotes needed for an order
   * @param data 
   * @param makerToken 
   * @param takerToken 
   * @returns 
   */
  private async makeQuotes(data:ActiveOrder, makerToken:OneInchToken, takerToken:OneInchToken):Promise<undefined|Record<string, Record<string, string|number>>> {
    const { 
      order: { makingAmount }
    } = data;

    const pair = `${makerToken.symbol}-${takerToken.symbol}`;
    const amountToQuote = this.amountDecimal(makingAmount, makerToken.decimals);


    const quoteParams:Record<string, number> = {};
    quoteParams[pair] = amountToQuote;
    if (takerToken.symbol !== 'ETH') {
      // if takerToken is not ETH - requesting rate for calculating gas costs
      quoteParams[`ETH-${takerToken.symbol}`] = 0.001; // 1 million gwei to approximate gas
    }
    let quotesByPair:Record<string, Record<string, string|number>> = {};
    try {
      quotesByPair = await this.getQuote(quoteParams);
    } catch(error) {
      console.error(`orders.makeQuotes: quote error:`, (error as any)?.message);
      return;
    }
    return quotesByPair;
  }
  
  
  /**
   * removes or sets an order inactive (if it was selected)
   * @param orderHash string
   */
  private async removeIfNotSelected(orderHash:string): Promise<void> {
    const orders = await this.app.service('orders').find({
      query: { order_hash: orderHash, is_active: true }
    });
    const [ order ] = orders.data;
    if (order) {
      if (order.is_selected) {
        // setting order inactive
        await this.app.service('orders').patch(order.id, { is_active: false });
      } else {
        // removing order
        await this.app.service('orders').remove(order.id);
      }
    }
  }
}
