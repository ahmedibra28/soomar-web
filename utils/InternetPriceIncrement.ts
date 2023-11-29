export const InternetPriceIncrement = ({
  amount,
  provider,
  platform,
}: {
  amount: number
  provider: string
  platform: string
}) => {
  if (provider === 'Somnet' && platform === 'dankaab') {
    // increment 5% if amount is between 0.26 - 5
    // increment 3% if amount is between 13 - 16

    if (amount >= 0.26 && amount <= 5) {
      amount = amount + amount * 0.05
    }

    if (amount >= 13 && amount <= 16) {
      amount = amount + amount * 0.03
    }
  }

  return amount
}
