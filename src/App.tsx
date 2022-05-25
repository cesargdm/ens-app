/* eslint-disable no-magic-numbers */
import { useEffect, useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'

import contractInterface from './ens-abi.json'
import { formatEther, getRandomHash, getYearsInSeconds } from './utils'
import {
  useIsAvailable,
  useMinCommitmentAge,
  useRentPrice,
} from './utils/hooks'

const ENS_ADDRESS = '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'
const ENS_RESOLVER = '0xf6305c19e814d2a75429Fd637d01F7ee0E77d615'
// const ENS_CONTROLLER = '0x6F628b68b30Dc3c17f345c9dbBb1E483c2b7aE5c'

const ensResolverConfig = { addressOrName: ENS_ADDRESS, contractInterface }

// ENS2 Resolver Mainnet 0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41

function getUnfinished() {
  const prev = localStorage.getItem('@cesargdm/unfinished')
  if (prev) {
    return JSON.parse(prev)
  }

  return {}
}

function App() {
  const [commitTimestamp, setCommitTimestamp] = useState(
    getUnfinished().commitTimestamp ?? 0,
  )

  const [query, setQuery] = useState('')
  const [domainName, setDomainName] = useState(
    getUnfinished()?.domainName ?? '',
  )
  const [years, setYears] = useState(
    getUnfinished()?.years ? Number(getUnfinished()?.years) : 1,
  )
  const [secret, setSecret] = useState(getUnfinished()?.secret ?? '')
  const [, tick] = useState(0)

  const { data: account } = useAccount()

  const minCommitmentAge = useMinCommitmentAge()
  const isAvailable = useIsAvailable({ domainName })
  const rentPrice = useRentPrice({ years, domainName })

  const {
    write: writeCommit,
    data: writeCommitData,
    isLoading: isLoadingCommit,
  } = useContractWrite(ensResolverConfig, 'commit', {
    onSuccess() {
      const data = { secret, domainName, years }
      localStorage.setItem('@cesargdm/unfinished', JSON.stringify(data))
    },
  })
  const commitTxHash = writeCommitData?.hash

  const { isLoading: isWaitingCommitTx } = useWaitForTransaction({
    hash: commitTxHash,
    enabled: Boolean(commitTxHash),
    onSuccess() {
      const data = { secret, commitTimestamp: Date.now(), domainName, years }
      setCommitTimestamp(data.commitTimestamp)
      localStorage.setItem('@cesargdm/unfinished', JSON.stringify(data))
    },
  })

  // Create commitment hash
  const { refetch: makeCommitmentWithConfig } = useContractRead(
    ensResolverConfig,
    'makeCommitmentWithConfig',
    {
      args: [
        domainName,
        account?.address,
        secret,
        ENS_RESOLVER,
        account?.address,
      ],
      enabled: false,
      onSuccess: (commitment) => writeCommit({ args: [commitment] }),
    },
  )

  const {
    write: writeRegister,
    data: writeRegisterCommitData,
    isLoading: isLoadingRegister,
  } = useContractWrite(ensResolverConfig, 'registerWithConfig')

  const registerTx = writeRegisterCommitData?.hash
  const { isLoading: isWaitingRegisterTx, data: registerTxData } =
    useWaitForTransaction({
      hash: registerTx,
      enabled: Boolean(registerTx),
      onSuccess() {
        // console.log({ registerTransaction })
        setCommitTimestamp(0)
        localStorage.removeItem('@cesargdm/unfinished')
      },
    })

  const waitTime = Math.max(
    minCommitmentAge - Math.ceil((Date.now() - Number(commitTimestamp)) / 1000),
    0,
  )

  useEffect(() => {
    if (waitTime <= 0) return

    // increment one second every second
    const interval = setInterval(() => {
      tick((prev) => prev + 1)
    }, 1000)

    return () => clearInterval(interval)
  }, [waitTime])

  function handleCommit() {
    if (secret) {
      makeCommitmentWithConfig()
      return
    }

    const newSecret = getRandomHash()

    setSecret(newSecret)
  }

  function handleRegister() {
    writeRegister({
      args: [
        domainName, // name
        account?.address, // owner
        getYearsInSeconds(years), // duration
        secret, // secret
        ENS_RESOLVER, // resolver
        account?.address, // addr
      ],
      overrides: {
        value: rentPrice ? rentPrice.add(rentPrice.div(10)) : 0,
        gasLimit: 300_000,
      },
    })
  }

  if (!account) {
    return (
      <div>
        <ConnectButton />
        <h1>Connect wallet</h1>
      </div>
    )
  }

  return (
    <main style={{ padding: 10 }}>
      <ConnectButton />
      <h1>Register</h1>
      {registerTxData ? (
        <>
          <div>
            <p>
              <b>{domainName}.eth</b>
            </p>
          </div>
          <div>
            <p>Now lets set it as your primary domain</p>
            <button>Set as primary</button>
          </div>
        </>
      ) : commitTimestamp > 0 ? (
        <>
          <div>
            <p>
              <b>{domainName}.eth</b>
            </p>
          </div>
          <div>
            <p>
              Now we need to wait 60 seconds so we can ensure no one else is
              trying to purchase the domain
            </p>
            {waitTime ? <p>Wait {waitTime}s</p> : <p>Ready!</p>}
            <button
              disabled={waitTime > 0 || isWaitingRegisterTx}
              onClick={handleRegister}
            >
              {isWaitingRegisterTx
                ? 'Waiting Transaction'
                : isLoadingRegister
                ? 'Waiting Confirmation'
                : 'Register'}
            </button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <label>
              <b>Domain Name</b>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  onChange={(event) => setQuery(event.target.value)}
                  value={query}
                />
              </div>
            </label>
            <button
              onClick={() => setDomainName(query)}
              disabled={!query.length}
            >
              {domainName ? 'Change' : 'Search'}
            </button>
          </div>
          {isAvailable && (
            <label>
              <b>Years</b>
              <input
                type="number"
                value={years}
                disabled={!isAvailable}
                onChange={(event) => setYears(Number(event.target.value))}
              />
            </label>
          )}
          <p>Cost: {formatEther(rentPrice)} + Fees</p>
          <button
            disabled={isWaitingCommitTx || !rentPrice || isLoadingCommit}
            onClick={handleCommit}
          >
            {isWaitingCommitTx
              ? 'Waiting transaction'
              : isLoadingCommit
              ? 'Waiting confirmation'
              : 'Commit'}
          </button>
        </>
      )}

      {/* <div>
        <code>
          {JSON.stringify(
            {
              writeCommitData: writeCommitData?.hash,
              domainName, // name
              owner: account?.address, // owner
              seconds: getYearsInSeconds(years), // duration
              secret, // secret
              ENS_RESOLVER, // resolver
            },
            null,
            2,
          )}
        </code>
      </div> */}
    </main>
  )
}

export default App
