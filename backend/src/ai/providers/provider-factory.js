import { MockProvider } from './mock.provider.js'
import { BedrockProvider } from '../../aws/providers/bedrock.provider.js'
import { OpenAIProvider } from './openai.provider.js'

export const getAiProvider = () => {
  const provider = process.env.AI_PROVIDER?.toLowerCase()

  switch (provider) {
    case 'bedrock':
      return new BedrockProvider()
    case 'openai':
      return new OpenAIProvider()
    case 'mock':
    default:
      return new MockProvider()
  }
}
