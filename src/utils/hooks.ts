import { useContractRead } from 'wagmi'

import contractInterface from 'utils/contracts/ens-registrar/abi.json'

import { getYearsInSeconds } from '.'

const ENS_ADDRESS = '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'

const ensResolverConfig = { addressOrName: ENS_ADDRESS, contractInterface }

export function useRentPrice({
  years,
  domainName,
}: {
  years?: number
  domainName?: string
}) {
  const { data: rentPrice, isLoading } = useContractRead(
    ensResolverConfig,
    'rentPrice',
    {
      args: [domainName, getYearsInSeconds(years as number)],
      enabled: Boolean(domainName && years),
    },
  )

  return { rentPrice, isLoading }
}

export function useIsAvailable({ domainName }: { domainName?: string }) {
  const { data: isAvailable, isLoading } = useContractRead(
    ensResolverConfig,
    'available',
    { args: [domainName], enabled: Boolean(domainName) },
  )

  return { isAvailable: Boolean(isAvailable), isLoading }
}

export function useMinCommitmentAge() {
  const { data: minCommitMentAge } = useContractRead(
    ensResolverConfig,
    'minCommitmentAge',
    { staleTime: 3600 },
  )

  return minCommitMentAge?.toNumber()
}
