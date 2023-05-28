import axios from 'axios'

const {
  INTERNET_RECHARGE_URL,
  INTERNET_RECHARGE_BUSINESS_KEY_MG,
  INTERNET_RECHARGE_USERNAME_MG,
  INTERNET_RECHARGE_PASSWORD_MG,
} = process.env

export const rechargeData = async ({
  amount,
  sender,
  receiver,
}: {
  amount: string
  sender: string
  receiver: string
}) => {
  const { data } = await axios.post(
    `${INTERNET_RECHARGE_URL}`,
    {
      username: INTERNET_RECHARGE_USERNAME_MG,
      password: INTERNET_RECHARGE_PASSWORD_MG,
      amount,
      sender,
      recharges: receiver,
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-KEY': INTERNET_RECHARGE_BUSINESS_KEY_MG,
      },
    }
  )
  return data
}
