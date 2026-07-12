import React, { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { aiApi } from '../../api/ai.api.js'

export function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am your AI assistant. How can I help you today?' }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const quickPrompts = [
    "Show broken laptops",
    "What are my bookings?",
    "Summarize recent activity"
  ]

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async (text) => {
    if (!text.trim()) return

    const userMessage = { role: 'user', content: text }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await aiApi.chat([...messages, userMessage])
      
      const assistantContent = response?.answer || response?.message || response?.data?.message || "I've processed your request."
      
      const assistantMessage = { 
        role: 'assistant', 
        content: assistantContent
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error("AI Chat Error:", error)
      setMessages(prev => [...prev, { role: 'assistant', content: '**Error:** Unable to connect to the AI service.' }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 p-4 bg-signal text-white rounded-full shadow-lg hover:bg-signal/90 transition-transform ${isOpen ? 'scale-0' : 'scale-100'} z-50`}
        aria-label="Open AI Assistant"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
        </svg>
      </button>

      {/* Chat Window Panel */}
      <div 
        className={`fixed bottom-6 right-6 w-full max-w-[calc(100vw-3rem)] sm:max-w-md h-[32rem] bg-paper-100 border border-black/10 rounded-2xl shadow-2xl flex flex-col transition-all duration-300 ease-in-out z-50 ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-10 scale-95 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 bg-ink text-white rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-signal p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-bold text-sm tracking-wide">AssetFlow AI</h3>
              <p className="font-mono text-[10px] text-white/50 uppercase">Intelligent Assistant</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/70 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-paper-100 text-sm font-body">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-sm ${msg.role === 'user' ? 'bg-signal text-white rounded-br-sm' : 'bg-white border border-black/5 text-ink rounded-bl-sm'}`}>
                {msg.role === 'assistant' ? (
                  <div className="[&>p]:my-1 [&>ul]:list-disc [&>ul]:ml-4 [&>ol]:list-decimal [&>ol]:ml-4 [&>h1]:font-bold [&>h2]:font-bold [&>h3]:font-bold [&>pre]:bg-black/5 [&>pre]:p-2 [&>pre]:rounded break-words">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  <div className="break-words">{msg.content}</div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-black/5 text-ink/50 rounded-2xl rounded-bl-sm p-3.5 shadow-sm flex items-center gap-1.5 text-xs font-medium h-[46px]">
                <span className="flex gap-1.5 items-center">
                  <span className="w-1.5 h-1.5 bg-signal/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                  <span className="w-1.5 h-1.5 bg-signal/80 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                  <span className="w-1.5 h-1.5 bg-signal rounded-full animate-bounce"></span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Prompts */}
        {messages.length === 1 && !isLoading && (
          <div className="px-4 py-2 bg-paper-100 flex gap-2 overflow-x-auto no-scrollbar pb-3">
            {quickPrompts.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(prompt)}
                className="whitespace-nowrap px-3.5 py-1.5 bg-white border border-black/10 text-ink/70 text-xs rounded-full hover:border-signal hover:text-signal transition-colors shadow-sm font-medium"
              >
                {prompt}
              </button>
            ))}
          </div>
        )}

        {/* Input area */}
        <div className="p-3 bg-white border-t border-black/5 rounded-b-2xl">
          <form 
            onSubmit={(e) => { e.preventDefault(); handleSend(input); }}
            className="flex items-center gap-2 bg-paper-100 border border-black/10 rounded-full px-4 py-2 focus-within:border-signal focus-within:ring-1 focus-within:ring-signal transition-all"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask AssetFlow AI..."
              className="flex-1 bg-transparent border-none outline-none text-sm text-ink placeholder-ink/40 font-body"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-1.5 bg-signal text-white rounded-full disabled:opacity-50 disabled:bg-ink/20 transition-colors shrink-0"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 translate-x-[1px]">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
