/**
 * List of all the networks supported by the Uniswap Interface
 */
export enum SupportedChainId {
  MAINNET = 1,
  ROPSTEN = 3,
  RINKEBY = 4,
  GOERLI = 5,
  KOVAN = 42,

  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,

  OPTIMISM = 10,
  OPTIMISM_GOERLI = 420,

  POLYGON = 137,
  POLYGON_MUMBAI = 80001,

  CELO = 42220,
  CELO_ALFAJORES = 44787,

  STARKNET = 15366,
  STARKNET_GOERLI = 15367,

  FANTOM = 250,

  AURORA = 1313161554,
  AURORA_TESTNET = 1313161555,

  BSC = 56,

  AVALANCHE = 43114,

  BASE = 8453,
}

export const VISIBLE_CHAIN_IDS: number[] = [
  SupportedChainId.MAINNET,
  SupportedChainId.POLYGON,
  SupportedChainId.STARKNET,
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.OPTIMISM,
  SupportedChainId.FANTOM,
  SupportedChainId.BSC,
  SupportedChainId.AVALANCHE,
  SupportedChainId.BASE,
]

export enum ChainName {
  MAINNET = 'mainnet',
  ROPSTEN = 'ropsten',
  RINKEBY = 'rinkeby',
  GOERLI = 'goerli',
  KOVAN = 'kovan',
  OPTIMISM = 'optimism-mainnet',
  OPTIMISM_GOERLI = 'optimism-goerli',
  ARBITRUM_ONE = 'arbitrum-mainnet',
  ARBITRUM_RINKEBY = 'arbitrum-rinkeby',
  POLYGON = 'polygon-mainnet',
  POLYGON_MUMBAI = 'polygon-mumbai',
  CELO = 'celo',
  CELO_ALFAJORES = 'celo-alfajores',
  AURORA = 'aurora',
  AURORA_TESTNET = 'aurora-testnet',
  BSC = 'bsc',
  AVALANCHE = 'avalanche',
  BASE = 'base',
}

/**
 * Array of all the supported chain IDs
 */
export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = Object.values(SupportedChainId).filter(
  (id) => typeof id === 'number'
) as SupportedChainId[]

/**
 * All the chain IDs that are running the Ethereum protocol.
 */
export const L1_CHAIN_IDS = [
  SupportedChainId.MAINNET,
  SupportedChainId.ROPSTEN,
  SupportedChainId.RINKEBY,
  SupportedChainId.GOERLI,
  SupportedChainId.KOVAN,
  SupportedChainId.POLYGON,
  SupportedChainId.POLYGON_MUMBAI,
  SupportedChainId.CELO,
  SupportedChainId.CELO_ALFAJORES,
  SupportedChainId.AURORA,
  SupportedChainId.AURORA_TESTNET,
  SupportedChainId.BSC,
  SupportedChainId.AVALANCHE,
] as const

export type SupportedL1ChainId = typeof L1_CHAIN_IDS[number]

/**
 * Controls some L2 specific behavior, e.g. slippage tolerance, special UI behavior.
 * The expectation is that all of these networks have immediate transaction confirmation.
 */
export const L2_CHAIN_IDS = [
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISM_GOERLI,
  SupportedChainId.BASE,
] as const

export type SupportedL2ChainId = typeof L2_CHAIN_IDS[number]
