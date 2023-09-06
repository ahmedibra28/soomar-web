import nc from 'next-connect'
import db from '../../../config/db'
import Notification from '../../../models/Notification'
import { isAuth } from '../../../utils/auth'
import axios from 'axios'
import Profile from '../../../models/Profile'

const handler = nc()

handler.use(isAuth)
handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()

    const { _id } = req.body

    try {
      const object = await Notification.findOne({ _id, type: 'system' })

      if (!object)
        return res.status(404).json({ error: 'Notification not found' })

      let tokens = await Profile.find(
        { 'settings.pushToken': { $exists: true } },
        { settings: 1 }
      ).lean()

      if (tokens.length === 0)
        return res.status(404).json({ error: 'No tokens were found' })

      tokens = tokens
        .filter((token) => token?.settings?.pushToken !== '')
        .map((token) => token?.settings?.pushToken)

      const splittedTokens = tokens.reduce((acc: any, curr, index) => {
        const group = Math.floor(index / 50)
        if (!acc[group]) {
          acc[group] = []
        }
        acc[group].push(curr)
        return acc
      }, [])

      const notificationResults = await Promise.all(
        splittedTokens.map(async (tokens: string[]) => {
          const messages = tokens.map((token: string) => ({
            to: token,
            title: object?.title,
            body: object?.message,
            data: {
              screen: 'Notification',
              params: { _id: '' },
            },
          }))
          // const all = {
          //   to: tokens,
          //   body: object?.message,
          // }

          const { data } = await axios.post(
            'https://exp.host/--/api/v2/push/send',
            messages,
            {
              headers: {
                Host: 'exp.host',
                Accept: 'application/json',
                'Accept-Encoding': 'gzip, deflate',
                'Content-Type': 'application/json',
              },
            }
          )

          return data
        })
      )

      res
        .status(200)
        .send(notificationResults?.map((item) => item?.data).flat())
    } catch (error: any) {
      res.status(500).json({
        error: error?.response?.data?.errors?.[0]?.message,
        details: error?.response?.data?.errors,
      })
    }
  }
)

export default handler
