import { useContractRead } from 'wagmi'

import contractInterface from '../ens-abi.json'

import { getYearsInSeconds } from '.'

const ENS_ADDRESS = '0x283Af0B28c62C092C9727F1Ee09c02CA627EB7F5'
// const ENS_RESOLVER = '0xf6305c19e814d2a75429Fd637d01F7ee0E77d615'
// const ENS_CONTROLLER = '0x6F628b68b30Dc3c17f345c9dbBb1E483c2b7aE5c'

const ensResolverConfig = { addressOrName: ENS_ADDRESS, contractInterface }

export function useRentPrice({
  years,
  domainName,
}: {
  years?: number
  domainName?: string
}) {
  const { data: rentPrice } = useContractRead(ensResolverConfig, 'rentPrice', {
    args: [domainName, getYearsInSeconds(years as number)],
    enabled: Boolean(domainName && years),
  })

  return rentPrice
}

export function useIsAvailable({
  domainName,
}: {
  domainName?: string
}): boolean {
  const { data: isAvailable } = useContractRead(
    ensResolverConfig,
    'available',
    { args: [domainName], enabled: Boolean(domainName) },
  )

  return Boolean(isAvailable)
}

export function useMinCommitmentAge() {
  const { data: minCommitMentAge } = useContractRead(
    ensResolverConfig,
    'minCommitmentAge',
    { staleTime: 3600 },
  )

  return minCommitMentAge?.toNumber()
}

// function useMakeCommitment(
//   {
//     domainName,
//     owner,
//     secret,
//   }: {
//     domainName?: string
//     owner?: string
//     secret?: string
//   },
//   options: { enabled: boolean; onSuccess?: (data: any) => void },
// ) {
//   return useContractRead(ensResolverConfig, 'makeCommitmentWithConfig', {
//     args: [domainName, owner, secret, ENS_RESOLVER, owner],
//     ...options,
//   })
// }
