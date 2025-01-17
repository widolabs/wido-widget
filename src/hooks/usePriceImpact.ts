import { Percent } from '@uniswap/sdk-core'
import { useMemo } from 'react'
import { WidoTrade } from 'state/routing/types'
import { computeFiatValuePriceImpact } from 'utils/computeFiatValuePriceImpact'
import { getPriceImpactWarning } from 'utils/prices'

export interface PriceImpact {
  percent: Percent
  warning?: 'warning' | 'error'
  toString(): string
}

export function usePriceImpact(trade?: WidoTrade) {
  return useMemo(() => {
    const fiatPriceImpact = computeFiatValuePriceImpact(trade?.inputAmountUsdValue, trade?.outputAmountUsdValue)

    const percent = fiatPriceImpact
    return percent
      ? {
          percent,
          warning: getPriceImpactWarning(percent),
          toString: () => toHumanReadablePercent(percent),
        }
      : undefined
  }, [trade])
}

export function toHumanReadablePercent(priceImpact: Percent): string {
  const sign = priceImpact.lessThan(0) ? '+' : ''
  const exactFloat = (Number(priceImpact.numerator) / Number(priceImpact.denominator)) * 100
  if (exactFloat < 0.005) {
    return '0.00%'
  }
  const number = parseFloat(priceImpact.multiply(-1)?.toFixed(2))
  return `${sign}${number}%`
}
