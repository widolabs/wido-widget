import { SupportedChainId } from 'constants/chains'
import { ChainError, useSwapInfo } from 'hooks/swap'
import { SwapApprovalState } from 'hooks/swap/useSwapApproval'
import { useIsWrap } from 'hooks/swap/useWrapCallback'
import { useEvmAccountAddress, useSnAccountAddress } from 'hooks/useSyncWidgetSettings'
import { widgetSettingsAtom } from 'hooks/useSyncWidgetSettings'
import { useAtomValue } from 'jotai/utils'
import { useMemo } from 'react'
import { Field } from 'state/swap'
import { isStarknetChain } from 'utils/starknet'

import ConnectWalletButton from './ConnectWalletButton'
import SwapButton from './SwapButton'
import SwitchChainButton from './SwitchChainButton'
import WrapButton from './WrapButton'

export default function SwapActionButton() {
  const account = useEvmAccountAddress()
  const snAccount = useSnAccountAddress()
  const {
    [Field.INPUT]: { currency: inputCurrency, amount: inputCurrencyAmount, balance: inputCurrencyBalance },
    [Field.OUTPUT]: { currency: outputCurrency },
    error,
    approval,
    trade: { trade },
  } = useSwapInfo()
  const isWrap = useIsWrap()
  const isDisabled = useMemo(
    () =>
      approval.state !== SwapApprovalState.APPROVED ||
      error !== undefined ||
      (!isWrap && !trade) ||
      !(inputCurrencyAmount && inputCurrencyBalance) ||
      inputCurrencyBalance.lessThan(inputCurrencyAmount),
    [approval.state, error, isWrap, trade, inputCurrencyAmount, inputCurrencyBalance]
  )
  const srcWalletConnected = isStarknetChain(inputCurrency?.chainId) ? snAccount : account
  const dstWalletConnected = isStarknetChain(outputCurrency?.chainId) ? snAccount : account

  const { toTokens, fromTokens } = useAtomValue(widgetSettingsAtom)
  const fromTokensCommonChainId =
    fromTokens &&
    fromTokens[0] &&
    (fromTokens.every((t) => t.chainId === fromTokens[0].chainId) ? fromTokens[0].chainId : undefined)
  const toTokensCommonChainId =
    toTokens &&
    toTokens[0] &&
    (toTokens.every((t) => t.chainId === toTokens[0].chainId) ? toTokens[0].chainId : undefined)
  const isToTokensEVM = toTokens && toTokens.every((t) => !isStarknetChain(t.chainId))
  const isFromTokensEVM = fromTokens && fromTokens.every((t) => !isStarknetChain(t.chainId))

  if (!inputCurrency && !outputCurrency) {
    if (fromTokensCommonChainId && (isStarknetChain(fromTokensCommonChainId) ? !snAccount : !account)) {
      // If the 'From' tokens are on the same chain then a 'Connect' button with this chain should appear
      return <ConnectWalletButton chainId={fromTokensCommonChainId} />
    } else if ((isToTokensEVM || isFromTokensEVM) && !account) {
      // If the 'From' or 'To' tokens are on the EVM chain then a 'Connect' button with the Ethereum chain should appear
      return <ConnectWalletButton chainId={1} />
    } else if (toTokensCommonChainId && isStarknetChain(toTokensCommonChainId) && !snAccount) {
      // If the 'To' tokens are on StarkNet, then a 'Connect' button with StarkNet chain should appear
      return <ConnectWalletButton chainId={toTokensCommonChainId} />
    } else {
      // If none of these apply, then a 'Select tokens' disabled button should be displayed
      return <SwapButton disabled={isDisabled} />
    }
  } else if (inputCurrency && !srcWalletConnected) {
    return <ConnectWalletButton chainId={inputCurrency.chainId} />
  } else if (outputCurrency && !dstWalletConnected) {
    return <ConnectWalletButton chainId={outputCurrency.chainId} />
  } else if (error === ChainError.MISMATCHED_CHAINS) {
    const tokenChainId = inputCurrency?.chainId ?? outputCurrency?.chainId ?? SupportedChainId.MAINNET
    return <SwitchChainButton chainId={tokenChainId} />
  } else if (isWrap) {
    return <WrapButton disabled={isDisabled} />
  } else {
    return <SwapButton disabled={isDisabled} />
  }
}
