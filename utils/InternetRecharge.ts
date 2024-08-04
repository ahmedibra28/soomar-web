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

  INTERNET_RECHARGE_BUSINESS_KEY_PL,
  INTERNET_RECHARGE_USERNAME_PL,
  INTERNET_RECHARGE_PASSWORD_PL,
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
  const obj = { username: '', password: '' }
  let businessKey = ''

  if (branch === 'Hargeisa') {
    obj.username = INTERNET_RECHARGE_USERNAME_HGA as string
    obj.password = INTERNET_RECHARGE_PASSWORD_HGA as string
    businessKey = INTERNET_RECHARGE_BUSINESS_KEY_HGA as string
  } else if (branch === 'Mogadishu') {
    obj.username = INTERNET_RECHARGE_USERNAME_MGQ as string
    obj.password = INTERNET_RECHARGE_PASSWORD_MGQ as string
    businessKey = INTERNET_RECHARGE_BUSINESS_KEY_MGQ as string
  } else if (branch === 'Puntland') {
    obj.username = INTERNET_RECHARGE_USERNAME_PL as string
    obj.password = INTERNET_RECHARGE_PASSWORD_PL as string
    businessKey = INTERNET_RECHARGE_BUSINESS_KEY_PL as string
  }

  const { data } = await axios.post(
    `${INTERNET_RECHARGE_URL}`,
    {
      ...obj,
      amount,
      sender,
      recharge: receiver,
      referenceId: uuidv4(),
      transactionId: uuidv4(),
    },
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-KEY': businessKey,
      },
    }
  )
  return data
}
