import React from 'react'
import ReactDOM from 'react-dom/client'

// eslint-disable-next-line import/no-unresolved
import '@rainbow-me/rainbowkit/styles.css'

import {
  apiProvider,
  configureChains,
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit'
import { chain, createClient, WagmiProvider } from 'wagmi'

const { chains, provider } = configureChains(
  [chain.rinkeby, chain.goerli],
  [apiProvider.alchemy(process.env.ALCHEMY_ID), apiProvider.fallback()],
)

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

import App from './App'
import './index.css'

const root = document.getElementById('root') as HTMLElement

ReactDOM.createRoot(root).render(
  <React.StrictMode>
    <WagmiProvider client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <App />
      </RainbowKitProvider>
    </WagmiProvider>
  </React.StrictMode>,
)
