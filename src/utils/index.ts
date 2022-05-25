import { formatUnits } from 'ethers/lib/utils'

export function getYearsInSeconds(years: number) {
  return years * 31556952
}

export function getRandomHash() {
  const random = new Uint8Array(32)
  crypto.getRandomValues(random)
  const salt =
    '0x' +
    Array.from(random)
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('')

  return salt
}

export function formatEther(value: any) {
  return value ? `${formatUnits(value.toString(), 18).toString()} ETH` : ''
}
