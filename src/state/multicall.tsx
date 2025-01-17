import { createMulticall } from '@uniswap/redux-multicall'
import { useEvmChainId } from 'hooks/useSyncWidgetSettings'
import useBlockNumber from 'hooks/useBlockNumber'
import { useInterfaceMulticall } from 'hooks/useContract'

const multicall = createMulticall()

export default multicall

export function MulticallUpdater() {
  const chainId = useEvmChainId()
  const latestBlockNumber = useBlockNumber()
  const contract = useInterfaceMulticall()
  return <multicall.Updater chainId={chainId} latestBlockNumber={latestBlockNumber} contract={contract} />
}
