'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageSquare, 
  Send, 
  Bot,
  User,
  Loader2,
  Plus,
  Package,
  Users,
  AlertTriangle,
  CheckCircle,
  X,
  Edit2,
  Sparkles
} from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import { useInventory } from '../context/InventoryContext'
import { useEmployee } from '../context/EmployeeContext'
import { useAuth } from '../context/AuthContext'

function ChatContent() {
  const { items, addItem, getLowStockItems, getExpiringItems } = useInventory()
  const { employees, positions, addEmployee } = useEmployee()
  const { currentUser } = useAuth()

  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: `Hi ${currentUser?.name || 'there'}! 👋 I'm your FoodStock AI assistant. I can help you:

• **Add inventory items** - Just tell me what you received
• **Add employees** - Describe the new team member
• **Check stock levels** - Ask about low stock or expiring items
• **Get reports** - Ask for summaries

Try saying something like "Add 24 cans of tomatoes" or "We hired a new cook named John"!`,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [pendingAction, setPendingAction] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const parseAIResponse = (content) => {
    // Try to extract JSON action from the response
    const jsonMatch = content.match(/```json\n?([\s\S]*?)\n?```/)
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[1])
      } catch (e) {
        return null
      }
    }
    return null
  }

  const getInventoryContext = () => {
    const lowStock = getLowStockItems()
    const expiring = getExpiringItems()
    return `
Current inventory status:
- Total items: ${items.length}
- Low stock items (${lowStock.length}): ${lowStock.map(i => i.name).join(', ') || 'None'}
- Expiring soon (${expiring.length}): ${expiring.map(i => i.name).join(', ') || 'None'}
- Total employees: ${employees.length}
`
  }

  const callOpenAI = async (userMessage) => {
    const contextMessage = getInventoryContext()
    
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
          { role: 'user', content: userMessage }
        ],
        context: contextMessage
      })
    })

    if (!response.ok) {
      throw new Error('Failed to get AI response')
    }

    const data = await response.json()
    return data.content
  }

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return

    const userMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const aiResponse = await callOpenAI(inputValue)
      
      // Check for action in response
      const action = parseAIResponse(aiResponse)
      
      // Clean the response (remove JSON block for display)
      let displayContent = aiResponse.replace(/```json\n?[\s\S]*?\n?```/g, '').trim()
      
      if (action) {
        setPendingAction(action)
        displayContent += '\n\n*Review the details above and click "Confirm" to add, or "Edit" to make changes.*'
      }

      const assistantMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: displayContent,
        action: action,
        timestamp: new Date()
      }

      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('AI Error:', error)
      
      // Fallback response
      const fallbackMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm having trouble connecting to my AI brain right now. But I can still help! Try these quick actions or tell me what you need.",
        timestamp: new Date()
      }
      setMessages(prev => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirmAction = () => {
    if (!pendingAction) return

    try {
      if (pendingAction.action === 'add_inventory') {
        addItem({
          ...pendingAction.data,
          quantity: Number(pendingAction.data.quantity) || 0,
          cost: Number(pendingAction.data.cost) || 0,
          minStock: Number(pendingAction.data.minStock) || 5,
          expirationDate: pendingAction.data.expirationDate || '',
          supplier: pendingAction.data.supplier || 'Unknown',
        })
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ **Added to inventory!**\n\n${pendingAction.data.quantity} ${pendingAction.data.unit} of ${pendingAction.data.name} has been added to your inventory.`,
          timestamp: new Date()
        }])
      } else if (pendingAction.action === 'add_employee') {
        addEmployee({
          ...pendingAction.data,
          hourlyRate: Number(pendingAction.data.hourlyRate) || 15,
        })
        
        setMessages(prev => [...prev, {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ **Employee added!**\n\n${pendingAction.data.name} has been added as a ${pendingAction.data.position} (${pendingAction.data.role}).`,
          timestamp: new Date()
        }])
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: `❌ **Error:** Could not complete the action. Please try again.`,
        timestamp: new Date()
      }])
    }

    setPendingAction(null)
  }

  const handleCancelAction = () => {
    setPendingAction(null)
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: "No problem! The action has been cancelled. What else can I help you with?",
      timestamp: new Date()
    }])
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const quickActions = [
    { label: 'Add Inventory', icon: Package, prompt: 'I want to add new inventory items' },
    { label: 'Add Employee', icon: Users, prompt: 'I need to add a new employee' },
    { label: 'Check Low Stock', icon: AlertTriangle, prompt: 'What items are running low?' },
  ]

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-4"
      >
        <div>
          <h1 className="font-display text-3xl font-bold text-sage-900 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            AI Assistant
          </h1>
          <p className="text-sage-500 mt-1">Chat with AI to manage your restaurant</p>
        </div>
      </motion.div>

      {/* Chat Container */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`
                  flex items-start gap-3 max-w-[80%]
                  ${message.role === 'user' ? 'flex-row-reverse' : ''}
                `}>
                  <div className={`
                    w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0
                    ${message.role === 'user' 
                      ? 'bg-brand-500' 
                      : 'bg-gradient-to-br from-purple-500 to-pink-500'}
                  `}>
                    {message.role === 'user' 
                      ? <User className="w-4 h-4 text-white" />
                      : <Bot className="w-4 h-4 text-white" />
                    }
                  </div>
                  <div className={`
                    rounded-2xl px-4 py-3
                    ${message.role === 'user' 
                      ? 'bg-brand-500 text-white' 
                      : 'bg-sage-100 text-sage-900'}
                  `}>
                    <div className="prose prose-sm max-w-none">
                      {message.content.split('\n').map((line, i) => (
                        <p key={i} className="mb-1 last:mb-0">
                          {line.startsWith('•') ? (
                            <span>{line}</span>
                          ) : line.startsWith('**') ? (
                            <strong>{line.replace(/\*\*/g, '')}</strong>
                          ) : (
                            line
                          )}
                        </p>
                      ))}
                    </div>
                    
                    {/* Action Preview */}
                    {message.action && pendingAction && (
                      <div className="mt-3 p-3 bg-white rounded-xl border border-sage-200">
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          {message.action.action === 'add_inventory' ? (
                            <><Package className="w-4 h-4" /> New Inventory Item</>
                          ) : (
                            <><Users className="w-4 h-4" /> New Employee</>
                          )}
                        </h4>
                        <div className="text-xs space-y-1 text-sage-600">
                          {Object.entries(message.action.data).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span className="capitalize">{key}:</span>
                              <span className="font-medium text-sage-900">{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex justify-start"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-sage-100 rounded-2xl px-4 py-3">
                  <Loader2 className="w-5 h-5 animate-spin text-sage-500" />
                </div>
              </div>
            </motion.div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Pending Action Buttons */}
        {pendingAction && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="px-4 py-3 bg-sage-50 border-t border-sage-200 flex justify-center gap-3"
          >
            <Button 
              variant="secondary" 
              icon={X}
              onClick={handleCancelAction}
            >
              Cancel
            </Button>
            <Button 
              variant="secondary" 
              icon={Edit2}
              onClick={() => {
                setInputValue(`Edit: ${JSON.stringify(pendingAction.data)}`)
                setPendingAction(null)
              }}
            >
              Edit
            </Button>
            <Button 
              icon={CheckCircle}
              onClick={handleConfirmAction}
            >
              Confirm & Add
            </Button>
          </motion.div>
        )}

        {/* Quick Actions */}
        {messages.length <= 2 && !pendingAction && (
          <div className="px-4 py-3 border-t border-sage-100">
            <p className="text-xs text-sage-500 mb-2">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action) => (
                <button
                  key={action.label}
                  onClick={() => setInputValue(action.prompt)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-sage-100 
                    text-sage-600 text-sm hover:bg-sage-200 transition-colors"
                >
                  <action.icon className="w-4 h-4" />
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-sage-100">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message... (e.g., 'Add 10 lbs of ground beef')"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-sage-200 
                  focus:ring-2 focus:ring-brand-500 focus:border-transparent
                  resize-none min-h-[52px] max-h-[120px]"
                rows={1}
                disabled={isLoading}
              />
            </div>
            <Button
              onClick={handleSend}
              disabled={!inputValue.trim() || isLoading}
              className="self-end"
            >
              <Send className="w-5 h-5" />
            </Button>
          </div>
          <p className="text-xs text-sage-400 mt-2 text-center">
            AI may make mistakes. Please review before confirming actions.
          </p>
        </div>
      </Card>
    </div>
  )
}

export default function ChatPage() {
  return (
    <PageWrapper>
      <ChatContent />
    </PageWrapper>
  )
}

