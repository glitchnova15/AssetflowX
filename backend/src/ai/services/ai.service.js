import { getAiProvider } from '../providers/provider-factory.js'

const getProvider = () => getAiProvider()

export const aiService = {
  chat: async (messages, user) => {
    const provider = getProvider()
    const context = { user }
    return provider.chat(messages, context)
  },
  
  summarize: async (text) => {
    const provider = getProvider()
    return provider.summarize(text)
  },
  
  search: async (query) => {
    const provider = getProvider()
    return provider.search(query)
  },
  
  recommend: async (user) => {
    const provider = getProvider()
    const context = { user }
    return provider.recommend(context)
  }
}
