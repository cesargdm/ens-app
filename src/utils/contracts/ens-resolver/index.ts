// Resolver
import { chain } from 'wagmi'

import abi from './abi.json'

export { abi }

export function getResolverAddress(networkId?: number) {
  if (networkId === chain.rinkeby.id)
    return '0xf6305c19e814d2a75429Fd637d01F7ee0E77d615'
  if (networkId === chain.goerli.id)
    return '0x4B1488B7a6B320d2D721406204aBc3eeAa9AD329'
  if (networkId === chain.mainnet.id)
    // Public resolver v2
    return '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41'
  return ''
}

export const contractConfig = (networkId?: number) => ({
  addressOrName: getResolverAddress(networkId),
  contractInterface: abi,
})
