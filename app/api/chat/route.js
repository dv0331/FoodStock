import { NextResponse } from 'next/server'

// API key is stored securely on server-side
// In production, use environment variable: process.env.OPENAI_API_KEY
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

const systemPrompt = `You are FoodStock AI, a helpful assistant for restaurant inventory management. You help users:
1. Add inventory items (you need: name, category, quantity, unit, cost, minStock, expirationDate)
2. Add employees (you need: name, email, phone, position, role, hourlyRate)
3. Check low stock items
4. Get inventory summaries
5. Answer questions about restaurant management

When the user wants to add something, extract the information and respond with a JSON action:
- For inventory: {"action": "add_inventory", "data": {"name": "...", "category": "...", "quantity": ..., "unit": "...", "cost": ..., "minStock": ..., "supplier": "..."}}
- For employees: {"action": "add_employee", "data": {"name": "...", "email": "...", "phone": "...", "position": "...", "role": "...", "hourlyRate": ...}}

Categories for inventory: Meat, Dairy, Vegetables, Fruits, Grains, Beverages, Condiments, Frozen, Dry Goods, Cleaning
Positions for employees: kitchen, front-desk, server, cashier, prep, dishwasher, manager, delivery
Roles for employees: staff, manager, admin

If information is missing, ask for it. Be friendly and helpful!
Always wrap JSON actions in \`\`\`json ... \`\`\` code blocks.`

export async function POST(request) {
  try {
    const { messages, context } = await request.json()

    if (!OPENAI_API_KEY) {
      // Return a helpful fallback response when no API key is configured
      return NextResponse.json({
        content: generateFallbackResponse(messages[messages.length - 1]?.content || '')
      })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt + '\n\n' + (context || '') },
          ...messages.slice(-10)
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    return NextResponse.json({
      content: data.choices[0].message.content
    })

  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json({
      content: generateFallbackResponse('')
    })
  }
}

function generateFallbackResponse(userMessage) {
  const msg = userMessage.toLowerCase()
  
  if (msg.includes('add') && (msg.includes('inventory') || msg.includes('item') || msg.includes('stock'))) {
    return `I'd love to help you add inventory! Please provide:

• **Item name** (e.g., "Ground Beef")
• **Quantity** (e.g., "10")
• **Unit** (e.g., "lbs", "cases", "cans")
• **Category** (Meat, Dairy, Vegetables, Fruits, etc.)

Example: "Add 10 lbs of ground beef to meat category"`
  }
  
  if (msg.includes('add') && msg.includes('employee')) {
    return `I can help you add a new employee! Please provide:

• **Name** (e.g., "John Smith")
• **Position** (Kitchen, Front Desk, Server, etc.)
• **Email** 
• **Hourly rate**

Example: "Add John Smith as a kitchen cook at $16/hour"`
  }
  
  if (msg.includes('low stock') || msg.includes('running low')) {
    return `To check low stock items, visit the **Alerts** page in the sidebar. 

I can help you add items that are running low! Just tell me:
- What item you need to order
- How much you want to add`
  }
  
  return `Hi! I'm your FoodStock AI assistant. I can help you:

• **Add inventory items** - Tell me what you received
• **Add employees** - Describe your new team member
• **Check stock levels** - Ask about inventory status

Try: "Add 24 cans of tomatoes" or "We hired a new server named Jane"

*Note: For full AI capabilities, please configure the OpenAI API key.*`
}

