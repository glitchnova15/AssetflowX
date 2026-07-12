import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime'
import { AppError } from '../../utils/app-error.js'
import { awsConfig } from '../config/aws.config.js'

export class BedrockProvider {
  constructor() {
    this.client = awsConfig.useLocal ? null : new BedrockRuntimeClient({ region: awsConfig.region })
    this.modelId = process.env.BEDROCK_MODEL_ID || 'anthropic.claude-3-haiku-20240307-v1:0'
  }

  async _invoke(promptSystem, promptUser) {
    if (awsConfig.useLocal) return '[LOCAL MOCK] Bedrock invoke mock response'
    try {
      const command = new ConverseCommand({
        modelId: this.modelId,
        system: [{ text: promptSystem }],
        messages: [{ role: 'user', content: [{ text: promptUser }] }],
      })
      
      let retries = 3
      let delay = 1000
      let response
      while (retries > 0) {
        try {
          response = await this.client.send(command)
          break
        } catch (err) {
          retries--
          if (retries === 0) throw err
          await new Promise(resolve => setTimeout(resolve, delay))
          delay *= 2
        }
      }
      
      return response.output.message.content[0].text
    } catch (error) {
      throw new AppError('Failed to interact with Bedrock: ' + error.message, 500, 'AI_PROVIDER_ERROR')
    }
  }

  async chat(messages, context) {
    if (awsConfig.useLocal) return '[LOCAL MOCK] Bedrock chat mock response'
    try {
      let formattedMessages = messages
      if (!Array.isArray(messages)) {
         formattedMessages = [{role: 'user', content: String(messages)}]
      }
      
      const command = new ConverseCommand({
        modelId: this.modelId,
        system: context ? [{ text: `Context: ${JSON.stringify(context)}` }] : undefined,
        messages: formattedMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: [{ text: m.content }]
        }))
      })
      
      let retries = 3
      let delay = 1000
      let response
      while (retries > 0) {
        try {
          response = await this.client.send(command)
          break
        } catch (err) {
          retries--
          if (retries === 0) throw err
          await new Promise(resolve => setTimeout(resolve, delay))
          delay *= 2
        }
      }

      return response.output.message.content[0].text
    } catch (error) {
      throw new AppError('Failed to interact with Bedrock: ' + error.message, 500, 'AI_PROVIDER_ERROR')
    }
  }

  async summarize(text) {
    return this._invoke('You are an expert summarizer.', `Please summarize the following text:\n\n${text}`)
  }

  async search(query) {
    return this._invoke('You are an expert search assistant.', `Please provide information or search results for the following query:\n\n${query}`)
  }

  async recommend(context) {
    return this._invoke('You are an expert recommendation engine.', `Based on the following context, please provide recommendations:\n\n${JSON.stringify(context)}`)
  }
}
