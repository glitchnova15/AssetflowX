import { asyncHandler } from '../../utils/async-handler.js'
import { aiService } from '../services/ai.service.js'

export const aiController = {
  chat: asyncHandler(async (req, res) => {
    const { messages } = req.body
    const response = await aiService.chat(messages, req.user)
    res.json({ success: true, data: response })
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
    const response = await aiService.recommend(req.user)
    res.json({ success: true, data: response })
  })
}
