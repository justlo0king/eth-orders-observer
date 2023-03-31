import axios, { AxiosResponse } from 'axios';

export type OpenOceanToken = {
  id: number;
  code: string;
  name: string;
  address: string;
  decimal: number;
  symbol: string;
  chain: string;
  usd: string;
}

export class OpenOceanClient {
  private uri = `https://open-api.openocean.finance/v3`;

  private async request(apiPath:string) {
    return axios.get(`${this.uri}/${apiPath}`);
  }

  private _tokens: Record<string, Record<string, OpenOceanToken>> = {};
  get tokens() {
    return this._tokens;
  }

  public async requestTokens(network:string='eth') {
    const response: AxiosResponse = await this.request(`${network}/tokenList`);
    const data = response.data?.data || [];
    if (Array.isArray(data)) {
      if (!this._tokens[network]) {
        this._tokens[network] = {};
      }
      data.forEach((token: OpenOceanToken) => {
        this._tokens[network][token.symbol] = token;
      })
    }
    return data;
  }

  public async quote(makerSymbol:string, takerSymbol:string, amount: number|string) {
    const makerToken = this._tokens.eth && this._tokens.eth[makerSymbol];
    const takerToken = this._tokens.eth && this._tokens.eth[takerSymbol];
    if (!makerToken) {
      throw new Error(`makerToken not found: ${makerSymbol}`);
    }
    if (!takerToken) {
      throw new Error(`takerToken not found: ${takerSymbol}`);
    }
    const { chain } = makerToken;
    const query:Record<string, unknown> = {
      chain,
      inTokenAddress: makerToken.address,
      outTokenAddress: takerToken.address,
      amount,
      gasPrice: 5,
      slippage: 1,
    };

    const queryStr = Object.keys(query).map((key) => {
      return `${key}=${query[key]}`;
    }).join(`&`);
    // console.log(`quote: ${makerSymbol}-${takerSymbol}, chain: ${chain}, queryStr: ${queryStr}`);
    const response: AxiosResponse = await this.request(`${chain}/quote?${queryStr}`);
    return response.data;
  }
}