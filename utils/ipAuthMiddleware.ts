export const ipAuthMiddleware = (
  req: NextApiRequestExtended,
  res: NextApiResponseExtended
) => {
  const allowedIPs = ['192.168.100.100']
  let shouldDisallowAccess = true
  const ip = (req.headers['x-forwarded-for'] ||
    req.connection.remoteAddress) as string

  if (!allowedIPs.includes(ip)) {
    shouldDisallowAccess = false
  }

  if (shouldDisallowAccess)
    return res.status(403).json({ error: `Not allowed ${ip}` })

  return { shouldDisallowAccess, ip }
}
