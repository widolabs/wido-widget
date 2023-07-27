import { Currency, CurrencyAmount, Fraction, Percent } from '@uniswap/sdk-core'
import JSBI from 'jsbi'

export function calcMinimumAmountOut(
  slippageTolerance: Percent,
  amountOut: CurrencyAmount<Currency>
): CurrencyAmount<Currency> {
  const ONE = JSBI.BigInt(1)
  const slippageAdjustedAmountOut = new Fraction(ONE).subtract(slippageTolerance).multiply(amountOut.quotient).quotient
  return CurrencyAmount.fromRawAmount(amountOut.currency, slippageAdjustedAmountOut)
}
