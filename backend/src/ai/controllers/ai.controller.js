import { asyncHandler } from '../../utils/async-handler.js'
import { aiService } from '../services/ai.service.js'

export const aiController = {
  chat: asyncHandler(async (req, res, next) => {
    try {
      const { messages } = req.body
      const user = req.auth ? { id: req.auth.userId, roles: req.auth.roles } : null
      const response = await aiService.chat(messages, user)
      res.json({ success: true, data: response })
    } catch (error) {
      console.error("AI CHAT ERROR:", error)
      next(error)
    }
  }),

  summarize: asyncHandler(async (req, res) => {
    const { text } = req.body
    const response = await aiService.summarize(text)
    res.json({ success: true, data: response })
  }),

  search: asyncHandler(async (req, res) => {
    const { query } = req.body
    const response = await aiService.search(query)
    res.json({ success: true, data: response })
  }),

  recommend: asyncHandler(async (req, res) => {
    const user = req.auth ? { id: req.auth.userId, roles: req.auth.roles } : null
    const response = await aiService.recommend(user)
    res.json({ success: true, data: response })
  })
}
