import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { atom } from 'jotai'
import { useAtomValue, useUpdateAtom } from 'jotai/utils'
import { createContext, PropsWithChildren, useContext, useMemo } from 'react'
import { Balance, getBalances, ZERO_ADDRESS } from 'wido'

import { useEvmAccountAddress, useSnAccountAddress } from './useSyncWidgetSettings'
import { NATIVE_ADDRESS } from './useTokenList/utils'
import { BigNumber } from 'ethers'

export type BalanceMap = { [chainId: number]: { [tokenAddress: string]: CurrencyAmount<Token> | undefined } }

export const evmBalancesAtom = atom<{
  [address: string]: Balance[]
}>({})
export const evmFetchedBalancesAtom = atom<{
  [address: string]: boolean
}>({})

export const snBalancesAtom = atom<{
  [address: string]: Balance[]
}>({})
export const snFetchedBalancesAtom = atom<{
  [address: string]: boolean
}>({})

const TokenBalancesContext = createContext<BalanceMap>([])

export function TokenBalancesProvider({ children }: PropsWithChildren) {
  const address = useEvmAccountAddress()
  const evmRawBalances = useAtomValue(evmBalancesAtom)
  const evmFetchedBalances = useAtomValue(evmFetchedBalancesAtom)
  const setEvmRawBalances = useUpdateAtom(evmBalancesAtom)
  const setEvmFetchedBalances = useUpdateAtom(evmFetchedBalancesAtom)

  if (address && !evmFetchedBalances[address]) {
    setEvmFetchedBalances({ [address]: true })
    getBalances(address).then((balances) => {
      setEvmRawBalances({ ...evmRawBalances, [address]: balances })
    })
  }

  const snAccount = useSnAccountAddress()
  const snRawBalances = useAtomValue(snBalancesAtom)
  const snFetchedBalances = useAtomValue(snFetchedBalancesAtom)
  const setSnRawBalances = useUpdateAtom(snBalancesAtom)
  const setSnFetchedBalances = useUpdateAtom(snFetchedBalancesAtom)

  if (snAccount && !snFetchedBalances[snAccount]) {
    setSnFetchedBalances({ [snAccount]: true })
    getBalances(snAccount).then((balances) => {
      setSnRawBalances({ ...snRawBalances, [snAccount]: balances })
    })
  }

  const value = useMemo(() => {
    const evmRawBalancesForCurrentUser = evmRawBalances[address || ''] || []
    const snRawBalancesForCurrentUser = snRawBalances[snAccount || ''] || []
    return [...evmRawBalancesForCurrentUser, ...snRawBalancesForCurrentUser].reduce((map: BalanceMap, item) => {
      if (!map[item.chainId]) {
        map[item.chainId] = {}
      }
      let balance = item.balance
      if (item.address === NATIVE_ADDRESS) {
        // FIX: native token has issues with wallet when max is used
        balance = BigNumber.from(balance).sub(2).toString()
      }
      map[item.chainId][item.address] = CurrencyAmount.fromRawAmount(
        new Token(item.chainId, ZERO_ADDRESS, item.decimals, item.symbol, item.name),
        balance
      )
      return map
    }, {} as BalanceMap)
  }, [address, evmRawBalances, snRawBalances, snAccount])

  return <TokenBalancesContext.Provider value={value}>{children}</TokenBalancesContext.Provider>
}

export function useTokenBalances(): BalanceMap {
  return useContext(TokenBalancesContext)
}

export function useCurrencyBalances(currencies?: (Currency | undefined)[]): (CurrencyAmount<Currency> | undefined)[] {
  const tokenBalances = useTokenBalances()

  return useMemo(
    () =>
      currencies?.map((currency) => {
        if (!currency) return undefined
        if (currency.isToken) return tokenBalances[currency.chainId]?.[currency.address]
        if (currency.isNative) return tokenBalances[currency.chainId]?.[NATIVE_ADDRESS]
        return undefined
      }) ?? [],
    [currencies, tokenBalances]
  )
}

export default function useCurrencyBalance(currency?: Currency): CurrencyAmount<Currency> | undefined {
  return useCurrencyBalances(useMemo(() => [currency], [currency]))[0]
}
