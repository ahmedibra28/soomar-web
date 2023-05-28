import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const {
  INTERNET_RECHARGE_URL,
  INTERNET_RECHARGE_BUSINESS_KEY_MGQ,
  INTERNET_RECHARGE_USERNAME_MGQ,
  INTERNET_RECHARGE_PASSWORD_MGQ,
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
      username: INTERNET_RECHARGE_USERNAME_MGQ,
      password: INTERNET_RECHARGE_PASSWORD_MGQ,
      amount,
      sender,
      recharge: receiver,
      referenceId: uuidv4(),
      transactionId: uuidv4(),
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-KEY': INTERNET_RECHARGE_BUSINESS_KEY_MGQ,
      },
    }
  )
  return data
}
