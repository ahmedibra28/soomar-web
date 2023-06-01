import axios from 'axios'
import { v4 as uuidv4 } from 'uuid'

const {
  INTERNET_RECHARGE_URL,
  INTERNET_RECHARGE_BUSINESS_KEY_MGQ,
  INTERNET_RECHARGE_USERNAME_MGQ,
  INTERNET_RECHARGE_PASSWORD_MGQ,

  INTERNET_RECHARGE_BUSINESS_KEY_HGA,
  INTERNET_RECHARGE_USERNAME_HGA,
  INTERNET_RECHARGE_PASSWORD_HGA,
} = process.env

export const rechargeData = async ({
  amount,
  sender,
  receiver,
  branch = 'Mogadishu',
}: {
  amount: string
  sender: string
  receiver: string
  branch?: string
}) => {
  const { data } = await axios.post(
    `${INTERNET_RECHARGE_URL}`,
    {
      username:
        branch === 'Hargeisa'
          ? INTERNET_RECHARGE_USERNAME_HGA
          : INTERNET_RECHARGE_USERNAME_MGQ,
      password:
        branch === 'Hargeisa'
          ? INTERNET_RECHARGE_PASSWORD_HGA
          : INTERNET_RECHARGE_PASSWORD_MGQ,
      amount,
      sender,
      recharge: receiver,
      referenceId: uuidv4(),
      transactionId: uuidv4(),
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-KEY':
          branch === 'Hargeisa'
            ? INTERNET_RECHARGE_BUSINESS_KEY_HGA
            : INTERNET_RECHARGE_BUSINESS_KEY_MGQ,
      },
    }
  )
  return data
}
