/* eslint-disable no-magic-numbers */
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

import { contractConfig } from 'utils/contracts/ens-registrar'
import { getResolverAddress } from 'utils/contracts/ens-resolver'
import { formatEther, getRandomHash, getYearsInSeconds } from 'utils'
import { useIsAvailable, useMinCommitmentAge, useRentPrice } from 'utils/hooks'

import IconButton from 'components/IconButton'
import Loader from 'components/Loader'
import Button from 'components/Button'

import { Description, Info, InputContainer, YearInput } from './styled'

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
  } = useContractWrite(contractConfig, 'commit', {
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
    contractConfig,
    'makeCommitmentWithConfig',
    {
      args: [
        domainName,
        account?.address,
        secret,
        getResolverAddress(activeChain?.id),
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
  } = useContractWrite(contractConfig, 'registerWithConfig')
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
        getResolverAddress(activeChain?.id),
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
