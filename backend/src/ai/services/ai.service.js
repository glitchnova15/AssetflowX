import { getAiProvider } from '../providers/provider-factory.js'
import { detectIntent, IntentTypes } from './intent-detector.js'
import { assetContextProvider } from '../providers/data/asset-context.provider.js'
import { bookingContextProvider } from '../providers/data/booking-context.provider.js'
import { maintenanceContextProvider } from '../providers/data/maintenance-context.provider.js'
import { dashboardContextProvider } from '../providers/data/dashboard-context.provider.js'
import { categoryContextProvider } from '../providers/data/category-context.provider.js'
import { logEvent } from '../../aws/providers/cloudwatch.provider.js'

const getProvider = () => getAiProvider()

const SYSTEM_PROMPT = `You are AssetFlow AI.

Answer ONLY using the supplied database context.

If the answer is not contained in the context, explicitly state that the information is unavailable.

Never invent assets, bookings, maintenance records or users.`

export const aiService = {
  chat: async (messages, user) => {
    const provider = getProvider()
    
    // 1. Get latest user message
    let latestMessage = ''
    if (Array.isArray(messages) && messages.length > 0) {
      latestMessage = messages[messages.length - 1].content || ''
    } else {
      latestMessage = String(messages)
    }

    // 2. Intent Detection
    const intent = detectIntent(latestMessage)
    
    // 3. Fetch Context from Data Providers
    const queryStart = Date.now()
    let contextData = ''
    
    let repositoryMethodCalled = ''
    switch (intent) {
      case IntentTypes.ASSET_SEARCH:
        repositoryMethodCalled = 'assetService.list'
        contextData = await assetContextProvider.getContext(user)
        break
      case IntentTypes.BOOKING_SEARCH:
        repositoryMethodCalled = 'bookingService.listBookings'
        contextData = await bookingContextProvider.getContext(user)
        break
      case IntentTypes.MAINTENANCE_SEARCH:
        repositoryMethodCalled = 'maintenanceService.listMaintenanceRequests'
        contextData = await maintenanceContextProvider.getContext(user)
        break
      case IntentTypes.DASHBOARD_SUMMARY:
        repositoryMethodCalled = 'analyticsRepository.getDashboardData'
        contextData = await dashboardContextProvider.getContext()
        break
      case IntentTypes.CATEGORY_SEARCH:
        repositoryMethodCalled = 'assetCategoryService.list'
        contextData = await categoryContextProvider.getContext(user)
        break
      default:
        repositoryMethodCalled = 'none'
        contextData = 'No specific database context provided for this general inquiry.'
    }
    const queryDuration = Date.now() - queryStart
    
    // Count records returned simply by counting lines that start with `- `
    const recordsReturned = (contextData.match(/^- /gm) || []).length

    console.log('\n--- AI TRACE LOG ---')
    console.log(`Intent Detected: ${intent}`)
    console.log(`Repository Method Called: ${repositoryMethodCalled}`)
    console.log(`Number of Records Returned: ${recordsReturned}`)
    console.log(`Final Database Context sent to Bedrock:\n${contextData}`)
    console.log('--------------------\n')

    // 4. Call Bedrock
    const response = await provider.chat({ 
      systemPrompt: SYSTEM_PROMPT, 
      context: contextData, 
      userMessage: latestMessage 
    })
    
    // 5. CloudWatch Logging
    const logMessage = JSON.stringify({
      intent,
      queryDurationMs: queryDuration,
      recordsReturned,
      bedrockLatencyMs: response.latency || 0,
      timestamp: new Date().toISOString()
    })
    
    // Best effort logging
    logEvent('AssetFlow-AI-Metrics', 'Query-Stats', logMessage).catch(err => {
      console.error('Failed to log AI metrics to CloudWatch', err)
    })

    return response.text || response
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
    return provider.recommend({ user })
  }
}
