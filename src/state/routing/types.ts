import { BigNumber } from '@ethersproject/bignumber'
import { Currency, CurrencyAmount, Price, TradeType } from '@uniswap/sdk-core'
import { RouterPreference } from 'hooks/routing/types'
import { QuoteRequest, QuoteResult, Step } from 'wido'

export declare enum ChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GÖRLI = 5,
  KOVAN = 42,
  OPTIMISM = 10,
  OPTIMISTIC_KOVAN = 69,
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  POLYGON = 137,
  POLYGON_MUMBAI = 80001,
  CELO = 42220,
  CELO_ALFAJORES = 44787,
  GNOSIS = 100,
  MOONBEAM = 1284
}

export enum TradeState {
  LOADING,
  INVALID,
  NO_ROUTE_FOUND,
  VALID,
}

// from https://github.com/Uniswap/routing-api/blob/main/lib/handlers/schema.ts

export interface GetQuoteArgs {
  tokenInAddress: string
  tokenInChainId: ChainId
  tokenOutAddress: string
  tokenOutChainId: ChainId
  amount: string | null // passing null will initialize the client-side SOR
  routerPreference?: RouterPreference
  // tradeType: TradeType
  userAddress?: string
  recipientAddress?: string
  slippagePercentage: number
  partner?: string
  quoteApi: (request: QuoteRequest) => Promise<QuoteResult>
}

export const INITIALIZED = 'Initialized'
export const NO_ROUTE = 'No Route'

export type GetQuoteResult = QuoteResult | typeof INITIALIZED | typeof NO_ROUTE

export interface WidoTradeType<TradeInput extends Currency, TradeOutput extends Currency> {
  inputAmount: CurrencyAmount<TradeInput>
  inputAmountUsdValue?: CurrencyAmount<Currency>
  outputAmount: CurrencyAmount<TradeOutput>
  outputAmountUsdValue?: CurrencyAmount<Currency>
  executionPrice: Price<TradeInput, TradeOutput>
  fromToken: Currency
  toToken: Currency
  tx?: {
    from: Required<QuoteResult>['from']
    to: Required<QuoteResult>['to']
    data: Required<QuoteResult>['data']
    value: BigNumber
  }
  tradeType: TradeType
  steps: Step[]
  messages: { type: 'info' | 'warning'; message: string }[]
  gasFee?: string
  gasFeeUsdValue?: string
}

export type WidoTrade = WidoTradeType<Currency, Currency>
