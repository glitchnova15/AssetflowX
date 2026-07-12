import { app } from './app.js'
import { env } from './config/env.js'
import { prisma } from './config/prisma.js'

const server = app.listen(env.PORT, () => {
  console.info(`AssetFlow API listening on port ${env.PORT}`)
})

const shutdown = (signal) => {
  console.info(`${signal} received; shutting down gracefully.`)
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })
}

process.once('SIGINT', () => shutdown('SIGINT'))
process.once('SIGTERM', () => shutdown('SIGTERM'))
