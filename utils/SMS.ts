import axios from 'axios'

const {
  MY_SMS_BASE_URL,
  MY_SMS_API_KEY,
  MY_SMS_USERNAME,

  DANKAAB_MY_SMS_API_KEY,
  DANKAAB_MY_SMS_USERNAME,
} = process.env
const username = MY_SMS_USERNAME
const password = MY_SMS_API_KEY

const dankaab_username = DANKAAB_MY_SMS_USERNAME
const dankaab_password = DANKAAB_MY_SMS_API_KEY

const grant_type = 'password'
const tokenURL = `${MY_SMS_BASE_URL}/token`
const sendSMS_URL = `${MY_SMS_BASE_URL}/api/SendSMS`

// // get access token
export const getToken = async (platform?: string) => {
  const { data } = await axios.post(
    tokenURL,
    `username=${
      platform === 'dankaab' ? dankaab_username : username
    }&password=${
      platform === 'dankaab' ? dankaab_password : password
    }&grant_type=${grant_type}`
  )
  return data
}

// // send SMS
export const sendSMS = async ({
  token,
  mobile,
  message,
}: {
  token: string
  mobile: string
  message: string
}) => {
  const { data } = await axios.post(
    sendSMS_URL,
    { mobile, message },
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    }
  )
  return data
}
