import crypto from 'node:crypto'
import { AppError } from '../utils/app-error.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { hashToken, signAccessToken, signRefreshToken, tokenExpiryDate, verifyRefreshToken } from '../utils/token.js'
import { refreshTokenRepository } from '../repositories/refresh-token.repository.js'
import { userRepository } from '../repositories/user.repository.js'

const roleCodes = (user) => user.roles.map(({ role }) => role.code)
const publicUser = (user) => ({ id: user.id, email: user.email, displayName: user.displayName, roles: roleCodes(user) })

async function issueTokenPair(user, familyId = crypto.randomUUID()) {
  const tokenId = crypto.randomUUID()
  const accessToken = signAccessToken({ userId: user.id, roles: roleCodes(user) })
  const refreshToken = signRefreshToken({ userId: user.id, tokenId })

  await refreshTokenRepository.create({
    id: tokenId,
    userId: user.id,
    familyId,
    tokenHash: hashToken(refreshToken),
    expiresAt: tokenExpiryDate(refreshToken),
  })

  return { user: publicUser(user), accessToken, refreshToken }
}

export const authService = {
  async register({ email, password, displayName }) {
    const existingUser = await userRepository.findByEmail(email)
    if (existingUser) throw new AppError('An account already exists for this email', 409, 'EMAIL_ALREADY_REGISTERED')

    const user = await userRepository.createEmployeeUser({
      email,
      displayName,
      passwordHash: await hashPassword(password),
    })

    return issueTokenPair(user)
  },

  async login({ email, password }) {
    const user = await userRepository.findByEmail(email)
    const passwordMatches = user?.passwordHash ? await verifyPassword(password, user.passwordHash) : false

    if (!user || !passwordMatches || user.status !== 'ACTIVE') {
      throw new AppError('Invalid email or password', 401, 'INVALID_CREDENTIALS')
    }

    return issueTokenPair(user)
  },

  async refresh(refreshToken) {
    let payload
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN')
    }

    const tokenHash = hashToken(refreshToken)
    const storedToken = await refreshTokenRepository.findByHash(tokenHash)
    if (!storedToken || storedToken.userId !== payload.sub || storedToken.expiresAt <= new Date()) {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN')
    }
    if (storedToken.revokedAt) {
      await refreshTokenRepository.revokeFamily(storedToken.familyId)
      throw new AppError('Refresh token has been revoked', 401, 'REFRESH_TOKEN_REUSED')
    }

    const revocation = await refreshTokenRepository.revokeByHash(tokenHash)
    if (revocation.count !== 1) throw new AppError('Refresh token has been revoked', 401, 'REFRESH_TOKEN_REUSED')

    const user = await userRepository.findById(payload.sub)
    if (!user || user.status !== 'ACTIVE') throw new AppError('Account is unavailable', 401, 'ACCOUNT_UNAVAILABLE')
    return issueTokenPair(user, storedToken.familyId)
  },

  async logout(refreshToken) {
    try {
      verifyRefreshToken(refreshToken)
    } catch {
      throw new AppError('Invalid or expired refresh token', 401, 'INVALID_REFRESH_TOKEN')
    }
    await refreshTokenRepository.revokeByHash(hashToken(refreshToken))
  },
}
