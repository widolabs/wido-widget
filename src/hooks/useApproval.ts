import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Currency, CurrencyAmount, Token } from '@uniswap/sdk-core'
import { useTokenContract } from 'hooks/useContract'
import { useEvmAccountAddress, useSnAccountAddress } from 'hooks/useSyncWidgetSettings'
import { useTokenAllowance } from 'hooks/useTokenAllowance'
import { useCallback, useMemo } from 'react'
import { calculateGasMargin } from 'utils/calculateGasMargin'
import { isStarknetChain } from 'utils/starknet'

export enum ApprovalState {
  UNKNOWN = 'UNKNOWN',
  NOT_APPROVED = 'NOT_APPROVED',
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
}

function useApprovalStateForSpender(
  chainId: number,
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): ApprovalState {
  const account = useEvmAccountAddress()
  const snAccount = useSnAccountAddress()
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined
  const owner = isStarknetChain(chainId) ? snAccount : account

  const { tokenAllowance } = useTokenAllowance(token, owner, spender)
  const pendingApproval = useIsPendingApproval(token, spender)

  return useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (amountToApprove.currency.isNative) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!tokenAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if tokenAllowance is
    return tokenAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, pendingApproval, spender, tokenAllowance])
}

export function useApproval(
  chainId: number,
  amountToApprove: CurrencyAmount<Currency> | undefined,
  spender: string | undefined,
  useIsPendingApproval: (token?: Token, spender?: string) => boolean
): [
  ApprovalState,
  () => Promise<{ response: TransactionResponse; tokenAddress: string; spenderAddress: string } | undefined>
] {
  const token = amountToApprove?.currency?.isToken ? amountToApprove.currency : undefined

  // check the current approval status
  const approvalState = useApprovalStateForSpender(chainId, amountToApprove, spender, useIsPendingApproval)

  const tokenContract = useTokenContract(token?.address)

  const approve = useCallback(async () => {
    function logFailure(error: Error | string): undefined {
      console.warn(`${token?.symbol || 'Token'} approval failed:`, error)
      return
    }

    // Bail early if there is an issue.
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      return logFailure('approve was called unnecessarily')
    } else if (!chainId) {
      return logFailure('no chainId')
    } else if (!token) {
      return logFailure('no token')
    } else if (!tokenContract) {
      return logFailure('tokenContract is null')
    } else if (!amountToApprove) {
      return logFailure('missing amount to approve')
    } else if (!spender) {
      return logFailure('no spender')
    }

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens which restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToApprove.quotient.toString())
    })

    return tokenContract
      .approve(spender, useExact ? amountToApprove.quotient.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas),
      })
      .then((response) => ({
        response: {
          ...response,
          chainId,
        },
        tokenAddress: token.address,
        spenderAddress: spender,
      }))
      .catch((error: Error) => {
        logFailure(error)
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, chainId])

  return [approvalState, approve]
}
