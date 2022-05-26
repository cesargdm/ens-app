import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { providers } from 'ethers'
import { chain, createClient, useNetwork, WagmiConfig } from 'wagmi'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { getDefaultWallets, RainbowKitProvider } from '@rainbow-me/rainbowkit'
// eslint-disable-next-line import/no-unresolved
import '@rainbow-me/rainbowkit/styles.css'

import App from './App'
import './index.css'
import './i18n'

const chains = [chain.rinkeby, chain.goerli]

const { connectors } = getDefaultWallets({
  appName: 'ENS App',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider: (config) => providers.getDefaultProvider(config.chainId),
})

const ensEndpoints = {
  mainnet: 'https://api.thegraph.com/subgraphs/name/ensdomains/ens',
  rinkeby: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensrinkeby',
  goerli: 'https://api.thegraph.com/subgraphs/name/ensdomains/ensgoerli',
}

function Root() {
  const [apolloClient, setApolloClient] =
    React.useState<ApolloClient<any> | null>(null)
  const { activeChain } = useNetwork()

  useEffect(() => {
    const client = new ApolloClient({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      uri: ensEndpoints[activeChain?.network as 'rinkeby'] ?? '',
      cache: new InMemoryCache(),
    })

    setApolloClient(client)
  }, [activeChain])

  if (!apolloClient) {
    return null
  }

  return (
    <ApolloProvider client={apolloClient}>
      <App />
    </ApolloProvider>
  )
}

const root = document.getElementById('root') as HTMLElement

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Root />
      </RainbowKitProvider>
    </WagmiConfig>
  </React.StrictMode>,
)
