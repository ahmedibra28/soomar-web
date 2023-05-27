import nc from 'next-connect'
import db from '../../../../config/db'
// import Bundle from '../../../../models/Bundle'
import { isAuth } from '../../../../utils/auth'

const handler = nc()
handler.use(isAuth)
handler.post(
  async (req: NextApiRequestExtended, res: NextApiResponseExtended) => {
    await db()
    try {
      console.log(req.body)
      //   const { id: category } = req.query

      //   if (!category) {
      //     return res.status(400).json({ error: 'Category is required' })
      //   }

      //   const bundles = await Bundle.find({
      //     internetCategory: category,
      //     status: 'active',
      //   })
      //     .sort({ createdAt: -1 })
      //     .lean()
      //     .populate({
      //       path: 'internetCategory',
      //       select: ['name', 'image', 'internetProvider'],
      //       populate: {
      //         path: 'internetProvider',
      //         select: ['name', 'image'],
      //       },
      //     })
      //     .select('-createdAt -updatedAt -__v -createdBy')

      //   return res.json(bundles)
      return res.json('success')
    } catch (error: any) {
      res.status(500).json({ error: error.message })
    }
  }
)

export default handler

// const SOMLINK = '6421558efb02b13e6b5f0ace'
// const HORMUUD = '6421552afb02b13e6b5f07cc'
// const SOMTEL = '6422f8e54f44fa88647f2587'
// const SOMNET = '64215500fb02b13e6b5efeac'
// const AMTEL = null
