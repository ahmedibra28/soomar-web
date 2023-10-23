import bcrypt from 'bcrypt'

export const encryptPassword = async function (password: string) {
  const salt = await bcrypt.genSalt(10)
  return await bcrypt.hash(password, salt)
}
