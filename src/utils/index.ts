import { formatUnits } from 'ethers/lib/utils'

const formatter = new Intl.NumberFormat('es-US', {
  minimumFractionDigits: 3,
  maximumFractionDigits: 3,
})

const SECONDS_IN_YEAR = 31557600
const RANDOM_CHARACTER_LENGTH = 32
const HEX_CHARACTERS = 16

export function getYearsInSeconds(years: number) {
  return years * SECONDS_IN_YEAR
}

export function getRandomHash() {
  const random = new Uint8Array(RANDOM_CHARACTER_LENGTH)

  crypto.getRandomValues(random)

  const salt =
    '0x' +
    Array.from(random)
      // eslint-disable-next-line no-magic-numbers
      .map((b) => b.toString(HEX_CHARACTERS).padStart(2, '0'))
      .join('')

  return salt
}

export function formatEther(value: any) {
  if (value) {
    // eslint-disable-next-line no-magic-numbers
    const amount = Number(formatUnits(value.toString(), 18))
    return `Ξ${formatter.format(amount)}`
  }

  return ''
}
