export const currency = (amount: number) => {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  })
  return formatter.format(amount)
}

export const currencySLSH = (amount: number): string => {
  return `SLSH ${amount}`
}
