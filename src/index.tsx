import { StrictMode, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { chain, createClient, useNetwork, WagmiConfig } from 'wagmi'
import {
  ApolloClient,
  ApolloLink,
  ApolloProvider,
  createHttpLink,
  InMemoryCache,
} from '@apollo/client'
import { RestLink } from 'apollo-link-rest'
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

const alchemyRestEndpoints = {
  [chain.mainnet
    .id]: `https://eth-mainnet.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
  [chain.goerli
    .id]: `https://eth-goerli.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
  [chain.rinkeby
    .id]: `https://eth-rinkeby.alchemyapi.io/v2/${process.env.REACT_APP_ALCHEMY_API_KEY}`,
}

function Root() {
  const [apolloClient, setApolloClient] = useState<ApolloClient<any> | null>(
    null,
  )
  const { activeChain } = useNetwork()

  useEffect(() => {
    const client = new ApolloClient({
      link: ApolloLink.from([
        new RestLink({
          uri: alchemyRestEndpoints[activeChain?.id ?? 0] ?? '',
        }),
        createHttpLink({ uri: ensEndpoints[activeChain?.id ?? 0] }),
      ]),
      cache: new InMemoryCache(),
      defaultOptions: {
        query: { fetchPolicy: 'standby' },
        watchQuery: { fetchPolicy: 'cache-and-network' },
      },
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
