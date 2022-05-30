import { getDefaultWallets } from '@rainbow-me/rainbowkit'
import { chain } from 'wagmi'
import { providers } from 'ethers'

const {
  VITE_APP_INFURA_PROJECT_ID: infuraId,
  VITE_APP_ALCHEMY_API_KEY: alchemiId,
  VITE_APP_ETHERSCAN_API_KEY: etherscanKey,
} = process.env

export const chains = [
  chain.rinkeby,
  chain.goerli,
  // NOTE: not ready
  //chain.mainnet
]

export const ensEndpoints = {
  [chain.mainnet.id]: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  [chain.rinkeby.id]:
    'https://api.thegraph.com/subgraphs/name/ensdomains/ensrinkeby',
  [chain.goerli.id]:
    'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli',
}

export const { connectors } = getDefaultWallets({ appName: 'ENS App', chains })

export function provider(config: any) {
  return providers.getDefaultProvider(config.chainId, {
    alchemi: alchemiId,
    infura: infuraId,
    etherscan: etherscanKey,
  })
}
