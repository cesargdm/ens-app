import { ConnectButton } from '@rainbow-me/rainbowkit'
import * as Tabs from '@radix-ui/react-tabs'
import { useTranslation } from 'react-i18next'
import styled from 'styled-components/macro'
import { useAccount } from 'wagmi'

import Register from 'containers/Register'
import Manage from 'containers/Manage'

const TabList = styled(Tabs.List)`
  display: flex;
  padding: 16px 16px 0;
  gap: 16px;

  button {
    border-radius: 0;
    background-color: transparent;
    position: relative;
    border-radius: 40px;
    flex: 1;
    display: flex;
    gap: 8px;
    justify-content: center;
    opacity: 0.7;
    color: var(--color-text-primary);

    &[data-state='active'] {
      opacity: 1;
      color: var(--colors--primary);
      background-color: var(--colors--primary-translucent);
    }

    :hover {
      opacity: 1;
      background-color: var(--colors--primary-translucent);
    }
  }
`

const Footer = styled.ul`
  margin-top: 16px;

  li {
    font-weight: 800;
    text-align: center;
    margin-bottom: 4px;
  }
`

const TabsRoot = styled(Tabs.Root)`
  background-color: var(--colors--background-content);
  border-radius: 30px;
  overflow: hidden;
  margin-top: 16px;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.05);
`

function App() {
  const { t } = useTranslation()

  const { data: account } = useAccount()

  if (!account) {
    return (
      <main style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
        <ConnectButton />
        <h1>ENS</h1>
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
      <TabsRoot defaultValue="register">
        <TabList>
          <Tabs.Trigger value="register">
            <span aria-hidden>💾</span>
            {t(`register`)}
          </Tabs.Trigger>
          <Tabs.Trigger value="manage">
            <span aria-hidden>🎛</span>
            {t(`manage`)}
          </Tabs.Trigger>
        </TabList>
        <div style={{ padding: 24 }}>
          <Tabs.Content value="register">
            <Register />
          </Tabs.Content>
          <Tabs.Content value="manage">
            <Manage />
          </Tabs.Content>
        </div>
      </TabsRoot>
      <Footer>
        <li>
          <a href="https://github.com/cesargdm/ens-app">👾 GitHub</a>
        </li>
        <li>
          <a href="https://cesargdm.xyz">cesargdm</a>
        </li>
      </Footer>
    </main>
  )
}

export default App
