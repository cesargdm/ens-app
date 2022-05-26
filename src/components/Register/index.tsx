/* eslint-disable no-magic-numbers */
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'

import contractInterface from '../../ens-abi.json'
import { formatEther, getRandomHash, getYearsInSeconds } from '../../utils'
import {
  useIsAvailable,
  useMinCommitmentAge,
  useRentPrice,
} from '../../utils/hooks'

import { SearchBar } from './styled'

const ENS_ADDRESS = '0x283af0b28c62c092c9727f1ee09c02ca627eb7f5'

const ENS_RESOLVER_RINKEBY = '0xf6305c19e814d2a75429Fd637d01F7ee0E77d615'
const ENS_RESOLVER_GOERLI = '0x4B1488B7a6B320d2D721406204aBc3eeAa9AD329'
// ENS_RESOLVER_MAINNET 0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41
// TODO: use either resolver depending on network
// const ENS_CONTROLLER = '0x6F628b68b30Dc3c17f345c9dbBb1E483c2b7aE5c'

const ensResolverConfig = { addressOrName: ENS_ADDRESS, contractInterface }

function getUnfinished() {
  const prev = localStorage.getItem('@cesargdm/unfinished')
  if (prev) {
    return JSON.parse(prev)
  }

  return {}
}

function Register() {
  const { t } = useTranslation()

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
        ENS_RESOLVER_RINKEBY,
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
        ENS_RESOLVER_RINKEBY, // resolver
        account?.address, // addr
      ],
      overrides: {
        value: rentPrice ? rentPrice.add(rentPrice.div(10)) : 0,
        gasLimit: 300_000,
      },
    })
  }

  return (
    <>
      <h1>{t(`register`)}</h1>
      {registerTxData ? (
        <>
          <div>
            <p>
              Congratulations!
              <b>{domainName}.eth</b> is now registered!
            </p>
          </div>
          <div>
            <p>
              Now you can also link your ethereum address to your new domain
            </p>
            <button>{t(`setAsPrimary`)}</button>
          </div>
        </>
      ) : commitTimestamp > 0 ? (
        <>
          <p style={{ textAlign: 'center', marginBottom: 16 }}>
            Locked <b>{domainName}.eth</b>!
          </p>
          <div>
            <p style={{ textAlign: 'center' }}>
              Now we need to wait 60 seconds so we can ensure no one else is
              trying to purchase the domain
            </p>
            <p style={{ textAlign: 'center', marginTop: 8 }}>
              {waitTime ? (
                <>
                  Wait <b>{waitTime}s</b>
                </>
              ) : (
                t(`ready`)
              )}
            </p>
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
          <SearchBar>
            <label>
              <b>{t(`domainName`)}</b>
              <div>
                <input
                  type="text"
                  placeholder={t(`placeholders.domainSearch`)}
                  onChange={(event) => setQuery(event.target.value)}
                  value={query}
                />
                <button
                  onClick={() => setDomainName(query)}
                  disabled={!query.length || query === domainName}
                >
                  {query && query !== domainName ? 'Change' : 'Search'}
                </button>
              </div>
            </label>
          </SearchBar>
          {isAvailable ? (
            <>
              <p
                style={{ textAlign: 'center', marginTop: 16, marginBottom: 8 }}
              >
                Congrats, <b>{domainName}.eth</b> is available! Now you can
                select the years you want to rent it for.
              </p>
              <SearchBar>
                <label>
                  <b>{t(`years`)}</b>
                  <div>
                    <input
                      min={1}
                      max={100}
                      step={1}
                      type="number"
                      value={years}
                      disabled={!isAvailable}
                      onChange={(event) => setYears(Number(event.target.value))}
                    />
                    <button
                      disabled={
                        isWaitingCommitTx || !rentPrice || isLoadingCommit
                      }
                      onClick={handleCommit}
                    >
                      {isWaitingCommitTx
                        ? 'Waiting transaction'
                        : isLoadingCommit
                        ? 'Waiting confirmation'
                        : `Commit`}
                    </button>
                  </div>
                </label>
              </SearchBar>
              <p style={{ textAlign: 'center', marginTop: 8, marginBottom: 8 }}>
                The estimated total is <b>{formatEther(rentPrice)}</b> + fees
                (gas)
              </p>
            </>
          ) : (
            <p style={{ textAlign: 'center', margin: '16px 0' }}>
              Oops, looks like <b>{domainName}.eth</b> is not available.
            </p>
          )}
        </>
      )}
    </>
  )
}

export default Register
