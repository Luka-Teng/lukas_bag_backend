import bcrypt from 'bcrypt'

export const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(parseInt(process.env.PASSWORD_SALT as string))
  const hash = await bcrypt.hash(password, salt)
  return hash
}

export const validatePassword = async (inputPassword: string, storedHash: string) => {
  return bcrypt.compare(inputPassword, storedHash)
}