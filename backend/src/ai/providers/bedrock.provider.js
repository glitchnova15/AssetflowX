import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime'
import { AppError } from '../../utils/app-error.js'
import { awsConfig } from '../../aws/config/aws.config.js'

export class BedrockProvider {
  constructor() {
    this.client = awsConfig.useLocal ? null : new BedrockRuntimeClient({ region: awsConfig.region })
    this.modelId = 'anthropic.claude-3-haiku-20240307-v1:0'
  }

  async _invoke(promptSystem, promptUser) {
    if (awsConfig.useLocal) return '[LOCAL MOCK] Bedrock invoke mock response'
    try {
      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1024,
        system: promptSystem,
        messages: [{ role: 'user', content: promptUser }],
      }
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      })
      const response = await this.client.send(command)
      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      return responseBody.content[0].text
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
      
      const payload = {
        anthropic_version: 'bedrock-2023-05-31',
        max_tokens: 1024,
        system: context ? `Context: ${JSON.stringify(context)}` : '',
        messages: formattedMessages.map(m => ({
          role: m.role === 'assistant' ? 'assistant' : 'user',
          content: m.content
        })),
      }
      const command = new InvokeModelCommand({
        modelId: this.modelId,
        contentType: 'application/json',
        accept: 'application/json',
        body: JSON.stringify(payload),
      })
      const response = await this.client.send(command)
      const responseBody = JSON.parse(new TextDecoder().decode(response.body))
      return responseBody.content[0].text
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
