import OpenAI from 'openai'
import { AppError } from '../../utils/app-error.js'

export class OpenAIProvider {
  constructor() {
    this.client = new OpenAI()
    this.model = 'gpt-4o-mini'
  }

  async chat(messages, context) {
    try {
      let formattedMessages = messages
      if (!Array.isArray(messages)) {
         formattedMessages = [{role: 'user', content: String(messages)}]
      }

      const systemMsg = context ? { role: 'system', content: `Context: ${JSON.stringify(context)}` } : { role: 'system', content: 'You are a helpful AI assistant.' }
      
      const response = await this.client.chat.completions.create({
        model: this.model,
        messages: [systemMsg, ...formattedMessages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))],
      })
      return response.choices[0].message.content
    } catch (error) {
      throw new AppError('Failed to interact with OpenAI: ' + error.message, 500, 'AI_PROVIDER_ERROR')
    }
  }

  async summarize(text) {
    return this.chat([{ role: 'user', content: `Please summarize the following text:\n\n${text}` }], 'You are an expert summarizer.')
  }

  async search(query) {
    return this.chat([{ role: 'user', content: `Please provide information or search results for the following query:\n\n${query}` }], 'You are an expert search assistant.')
  }

  async recommend(context) {
    return this.chat([{ role: 'user', content: `Based on the following context, please provide recommendations:\n\n${JSON.stringify(context)}` }], 'You are an expert recommendation engine.')
  }
}
