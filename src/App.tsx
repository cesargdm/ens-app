import { ConnectButton } from '@rainbow-me/rainbowkit'
import * as Tabs from '@radix-ui/react-tabs'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/macro'
import { useAccount } from 'wagmi'

import Register from './components/Register'
import Manage from './components/Manage'

const TabList = styled(Tabs.List)`
  border-bottom: 2px solid var(--colors--border);
  display: flex;

  button {
    border-radius: 0;
    background-color: transparent;
    color: var(--colors--primary);
    padding: 12px 24px;
    position: relative;
    flex: 1;

    &[data-state='active']:after {
      display: block;
      content: '';
      position: absolute;
      bottom: -2px;
      left: 0;
      width: 100%;
      height: 2px;
      background-color: var(--colors--primary);
    }

    :hover {
      border-radius: 0;
      background-color: var(--colors--primary-translucent);
    }
  }
`

function App() {
  const { t } = useTranslation()

  const { data: account } = useAccount()

  if (!account) {
    return (
      <main style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
        <ConnectButton />
        <h1>ENS App</h1>
        <p>
          This application enables the registration of ens (.eth) domains,
          please connect your wallet to use the app
        </p>
      </main>
    )
  }

  return (
    <main style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
      <ConnectButton />

      <h1 style={{ textAlign: 'center', marginTop: 16 }}>ENS</h1>
      <Tabs.Root
        style={{
          backgroundColor: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          marginTop: 16,
          boxShadow: '0px 0px 8px rgba(0, 0, 0, 0.06)',
        }}
        defaultValue="register"
      >
        <TabList>
          <Tabs.Trigger value="register">{t(`register`)}</Tabs.Trigger>
          <Tabs.Trigger value="manage">{t(`manage`)}</Tabs.Trigger>
        </TabList>
        <div style={{ padding: 8 }}>
          <Tabs.Content value="register">
            <Register />
          </Tabs.Content>
          <Tabs.Content value="manage">
            <Manage />
          </Tabs.Content>
        </div>
      </Tabs.Root>
    </main>
  )
}

export default App
