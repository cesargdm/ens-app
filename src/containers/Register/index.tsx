/* eslint-disable no-magic-numbers */
import { chain } from '@wagmi/core'
import { useEffect, useState } from 'react'
import { Check, ChevronRight, Lock, Search } from 'react-feather'
import { useTranslation } from 'react-i18next'
import slugify from 'slugify'
import {
  useNetwork,
  useAccount,
  useContractRead,
  useContractWrite,
  useWaitForTransaction,
} from 'wagmi'

import contractInterface from 'utils/contracts/ens-registrar/abi.json'
import { formatEther, getRandomHash, getYearsInSeconds } from 'utils'
import { useIsAvailable, useMinCommitmentAge, useRentPrice } from 'utils/hooks'

import IconButton from 'components/IconButton'
import Loader from 'components/Loader'
import Button from 'components/Button'

import { Description, Info, InputContainer, YearInput } from './styled'

const ENS_ADDRESS = '0x283af0b28c62c092c9727f1ee09c02ca627eb7f5'

function getResolver(networkId?: number) {
  if (networkId === chain.rinkeby.id)
    return '0xf6305c19e814d2a75429Fd637d01F7ee0E77d615'
  if (networkId === chain.goerli.id)
    return '0x4B1488B7a6B320d2D721406204aBc3eeAa9AD329'
  if (networkId === chain.mainnet.id)
    return '0x4976fb03c32e5b8cfe2b6ccb31c09ba78ebaba41'
  return ''
}

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
  const { activeChain } = useNetwork()
  const [domainName, setDomainName] = useState(
    getUnfinished()?.domainName ?? '',
  )
  const [years, setYears] = useState(
    getUnfinished()?.years ? Number(getUnfinished()?.years) : 0,
  )
  const [secret, setSecret] = useState(getUnfinished()?.secret ?? '')
  const [, tick] = useState(0)

  const { data: account } = useAccount()

  const minCommitmentAge = useMinCommitmentAge()
  const { isAvailable, isLoading: isAvailableLoading } = useIsAvailable({
    domainName,
  })
  const { rentPrice, isLoading: isLoadingRentPrice } = useRentPrice({
    years: years || 1,
    domainName,
  })

  // TODO: wrap contractWrite and confirm in single hook
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
        getResolver(activeChain?.id),
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
    if (!query) return

    const delayDebounceFn = setTimeout(() => {
      setDomainName(query)
    }, 1000)

    return () => clearTimeout(delayDebounceFn)
  }, [query])

  useEffect(() => {
    if (waitTime <= 0) return
    // increment one second every second
    const interval = setInterval(() => tick((prev) => prev + 1), 1000)
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
        domainName,
        account?.address, // owner
        getYearsInSeconds(years),
        secret,
        getResolver(activeChain?.id),
        account?.address, // addr
      ],
      overrides: {
        value: rentPrice ? rentPrice.add(rentPrice.div(10)) : 0,
        gasLimit: 300_000,
      },
    })
  }

  const isSearching = isAvailableLoading || query !== domainName
  const isDomainSelected = years > 0
  const isDomainLocked = commitTimestamp > 0

  return (
    <>
      <h2>{isDomainSelected ? `${domainName}.eth` : t(`findYourName`)}</h2>
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
            <Button>
              {t(`setAsPrimary`)}
              <ChevronRight />
            </Button>
          </div>
        </>
      ) : isDomainLocked ? (
        <>
          <p style={{ textAlign: 'center', marginBottom: 16 }}>
            Locked <b>{domainName}.eth</b>!
          </p>
          <div>
            <Info>{t(`register.locked.info`)}</Info>
            <Button
              disabled={waitTime > 0 || isWaitingRegisterTx}
              onClick={handleRegister}
              pulse={isWaitingRegisterTx}
            >
              {waitTime ? (
                `${t('wait')} ${waitTime}s`
              ) : isWaitingRegisterTx ? (
                t('waitingTransaction')
              ) : isLoadingRegister ? (
                t('waitingConfirmation')
              ) : (
                <>
                  {t(`register`)}
                  <Check />
                </>
              )}
            </Button>
          </div>
        </>
      ) : isDomainSelected ? (
        <>
          <Description>{t(`register.years.description`)}</Description>
          <InputContainer>
            <YearInput>
              <IconButton
                onClick={() => setYears((prev) => prev - 1)}
                disabled={years === 1 || isWaitingCommitTx || isLoadingCommit}
              >
                -
              </IconButton>
              <label>
                <b>{t(`years`)}</b>
                <input
                  min={1}
                  max={100}
                  step={1}
                  type="number"
                  value={years}
                  disabled={!isAvailable}
                  onChange={(event) => setYears(Number(event.target.value))}
                />
              </label>
              <IconButton
                disabled={isWaitingCommitTx || isLoadingCommit}
                onClick={() => setYears((prev) => prev + 1)}
              >
                +
              </IconButton>
            </YearInput>

            <Button
              disabled={
                isWaitingCommitTx ||
                !rentPrice ||
                isLoadingCommit ||
                isLoadingRentPrice
              }
              onClick={handleCommit}
              pulse={isWaitingCommitTx}
            >
              {isWaitingCommitTx ? (
                t('waitingTransaction')
              ) : isLoadingCommit ? (
                t('waitingConfirmation')
              ) : (
                <>
                  {secret ? t(`lock`) : t(`confirm`)}
                  {secret ? <Lock /> : <ChevronRight />}
                </>
              )}
            </Button>
          </InputContainer>
          <Info>
            The estimated total is <b>{formatEther(rentPrice)}</b> + fees (gas)
          </Info>
        </>
      ) : (
        <>
          <InputContainer>
            <Description>{t(`register.search.description`)}</Description>
            <label>
              <b>{t(`domainName`)}</b>
              <div style={{ position: 'relative' }}>
                <Search size={20} strokeWidth={4} />
                <input
                  type="search"
                  placeholder={t(`placeholders.domainSearch`)}
                  onChange={(event) =>
                    setQuery(
                      slugify(event.target.value, {
                        lower: true,
                        remove: /\./,
                      }),
                    )
                  }
                  value={query}
                />
                {isSearching && <Loader />}
              </div>
            </label>
          </InputContainer>
          {!isSearching &&
            domainName.length > 0 &&
            (isAvailable ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Info success>
                    🥳 <b>{domainName}.eth</b> is available!
                  </Info>
                  <Info>
                    {formatEther(rentPrice)} / {t(`year`)}
                  </Info>
                </div>
                <Button onClick={() => setYears(1)}>
                  {t(`continue`)}
                  <ChevronRight />
                </Button>
              </>
            ) : (
              <Info error>
                😞 Oops, looks like <b>{domainName}.eth</b> is not available.
              </Info>
            ))}
        </>
      )}
    </>
  )
}

export default Register
