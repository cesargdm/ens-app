import { useContractRead } from 'wagmi'

import { contractConfig } from './contracts/ens-registrar'

import { getYearsInSeconds } from '.'

export function useRentPrice({
  years,
  domainName,
}: {
  years?: number
  domainName?: string
}) {
  const { data: rentPrice, isLoading } = useContractRead(
    contractConfig,
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
    contractConfig,
    'available',
    { args: [domainName], enabled: Boolean(domainName) },
  )

  return { isAvailable: Boolean(isAvailable), isLoading }
}

export function useMinCommitmentAge() {
  const { data: minCommitMentAge } = useContractRead(
    contractConfig,
    'minCommitmentAge',
    { staleTime: 3600 },
  )

  return minCommitMentAge?.toNumber()
}
