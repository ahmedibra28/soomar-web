import nc from 'next-connect'
import db from '../../../../config/db'
import User from '../../../../models/User'

const handler = nc()

handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    try {
      await db()

      const { _id, otp } = req.body
      if (!otp) return res.status(400).json({ error: 'Please enter your OTP' })

      const user = await User.findOne({
        _id,
        otpExpire: { $gt: Date.now() },
      })

      if (!user)
        return res.status(400).json({ error: `Invalid OTP or expired` })

      if (Number(user.otp) !== Number(otp))
        return res.status(400).json({ error: 'Invalid OTP or expired' })

      if (user.blocked)
        return res.status(401).send({ error: 'User is blocked' })

      if (!user.confirmed)
        return res.status(401).send({ error: 'User is not confirmed' })

      if (user.isDeleted)
        return res.status(401).send({ error: 'User is already deleted' })

      user.otp = undefined
      user.otpExpire = undefined
      user.isReal = true

      user.isDeleted = true
      user.blocked = true

      await user.save()

      return res.send({
        success: true,
        status: 200,
      })
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler
