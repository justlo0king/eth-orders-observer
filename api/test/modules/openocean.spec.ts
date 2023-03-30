import axios from 'axios';
import { OpenOceanClient } from '../../src/modules/openocean/client';
import sampleTokensEth from '../data/openocean/tokens_eth.json';
import sampleQuoteEth from '../data/openocean/quote_usdc_mcb.json';

const SEND_REQUESTS = process.env.SEND_REQUESTS || false;
if (!SEND_REQUESTS) {
  jest.mock('axios');
}

describe(`OpenOcean`, () => {
  let ooClient: OpenOceanClient;
  it(`should init client`, () => {
    ooClient = new OpenOceanClient();
    expect(ooClient).toBeTruthy();
  });

  it(`should request ETH tokens`, async () => {
    if (!SEND_REQUESTS) {
      axios.get = jest.fn().mockResolvedValueOnce({
        data: {
          data: sampleTokensEth,
          status: 200,
        }
      });
    }
    await ooClient.requestTokens('eth');
    if (!SEND_REQUESTS) expect(axios.get).toBeCalledTimes(1);
    expect(Object.keys(ooClient.tokens.eth).length).toBeGreaterThan(0);
  });

  it(`should request rates`, async () => {
    if (!SEND_REQUESTS) {
      axios.get = jest.fn().mockResolvedValue({
        data: sampleQuoteEth
      });
    }
    const quote = await ooClient.quote('USDC', 'ETH', 1000);
    if (!SEND_REQUESTS) expect(axios.get).toBeCalledTimes(1);
    const { 
      inToken: { decimals: inDecimals }, 
      outToken: { decimals: outDecimals }, 
      inAmount, outAmount, estimatedGas
    } = quote.data;
    expect(inAmount).toBeTruthy();
    expect(outAmount).toBeTruthy();
    expect(estimatedGas).toBeTruthy();
    expect(inDecimals).toBeTruthy();
    expect(outDecimals).toBeTruthy();
  });
});