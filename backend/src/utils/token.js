import crypto from 'node:crypto'
import jwt from 'jsonwebtoken'
import { env } from '../config/env.js'

const jwtOptions = { issuer: 'assetflow-api', audience: 'assetflow-client' }

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')

export const signAccessToken = ({ userId, roles }) =>
  jwt.sign({ roles, tokenType: 'access' }, env.JWT_ACCESS_SECRET, {
    ...jwtOptions,
    subject: userId,
    expiresIn: env.JWT_ACCESS_EXPIRES_IN,
  })

export const signRefreshToken = ({ userId, tokenId }) =>
  jwt.sign({ jti: tokenId, tokenType: 'refresh' }, env.JWT_REFRESH_SECRET, {
    ...jwtOptions,
    subject: userId,
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
  })

export const verifyAccessToken = (token) => {
  const payload = jwt.verify(token, env.JWT_ACCESS_SECRET, jwtOptions)
  if (payload.tokenType !== 'access' || typeof payload.sub !== 'string') throw new jwt.JsonWebTokenError('Invalid access token')
  return payload
}

export const verifyRefreshToken = (token) => {
  const payload = jwt.verify(token, env.JWT_REFRESH_SECRET, jwtOptions)
  if (payload.tokenType !== 'refresh' || typeof payload.sub !== 'string' || typeof payload.jti !== 'string') throw new jwt.JsonWebTokenError('Invalid refresh token')
  return payload
}

export const tokenExpiryDate = (token) => {
  const payload = jwt.decode(token)
  if (!payload || typeof payload === 'string' || typeof payload.exp !== 'number') throw new Error('JWT expiry is missing')
  return new Date(payload.exp * 1000)
}
