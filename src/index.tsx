/* eslint-disable @typescript-eslint/no-var-requires */
import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { createClient, useNetwork, WagmiConfig } from 'wagmi'
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { RainbowKitProvider } from '@rainbow-me/rainbowkit'
// eslint-disable-next-line import/no-unresolved
import '@rainbow-me/rainbowkit/styles.css'

import 'utils/polyfills'
import { connectors, ensEndpoints, chains, provider } from 'utils/constants'

import App from './App'
import './main.css'
import './i18n'

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

function Root() {
  const [apolloClient, setApolloClient] = useState<ApolloClient<any> | null>(
    null,
  )
  const { activeChain } = useNetwork()

  useEffect(() => {
    const client = new ApolloClient({
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      uri: ensEndpoints[activeChain?.id ?? 0] ?? '',
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
  <StrictMode>
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Root />
      </RainbowKitProvider>
    </WagmiConfig>
  </StrictMode>,
)
