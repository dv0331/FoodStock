import { NextResponse } from 'next/server'

// API key for OpenAI - Set OPENAI_API_KEY environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

const systemPrompt = `You are FoodStock AI, a helpful assistant for restaurant inventory and employee management. You can help with:

1. INVENTORY MANAGEMENT:
   - Add inventory items (name, category, quantity, unit, cost, minStock, supplier)
   - Categories: Meat, Dairy, Vegetables, Fruits, Grains, Beverages, Condiments, Frozen, Dry Goods, Cleaning

2. EMPLOYEE MANAGEMENT:
   - Add employees (name, email, phone, position, role, hourlyRate)
   - Positions: kitchen, front-desk, server, cashier, prep, dishwasher, manager, delivery, restocking, cleaning, barista, expeditor, busser, grill, fry
   - Roles: staff, manager, admin

3. SCHEDULING:
   - Create shifts with position, date, startTime, endTime, tasks
   - Suggest optimal schedules based on availability

4. GENERAL HELP:
   - Answer questions about restaurant management
   - Provide tips and best practices

When the user wants to add/create something, respond with a JSON action block:

For inventory:
\`\`\`json
{"action": "add_inventory", "data": {"name": "Item Name", "category": "Category", "quantity": 10, "unit": "lbs", "cost": 25.99, "minStock": 5, "supplier": "Supplier Name"}}
\`\`\`

For employees:
\`\`\`json
{"action": "add_employee", "data": {"name": "John Doe", "email": "john@email.com", "phone": "(555) 123-4567", "position": "kitchen", "role": "staff", "hourlyRate": 15.00}}
\`\`\`

For shifts:
\`\`\`json
{"action": "add_shift", "data": {"employeeId": "emp-id", "position": "kitchen", "date": "2025-01-01", "startTime": "09:00", "endTime": "17:00", "tasks": ["Cook food", "Clean station"], "notes": "Training day"}}
\`\`\`

IMPORTANT:
- Always ask for missing required information before generating the action
- Be friendly and conversational
- Provide helpful suggestions
- Always wrap JSON in code blocks`

export async function POST(request) {
  try {
    const { messages, context } = await request.json()

    if (!OPENAI_API_KEY) {
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
        max_tokens: 800
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
  
  // Inventory related
  if (msg.includes('add') && (msg.includes('inventory') || msg.includes('item') || msg.includes('stock'))) {
    // Try to extract information from the message
    const quantityMatch = msg.match(/(\d+)\s*(lbs?|pounds?|cases?|cans?|boxes?|pcs?|pieces?|gallons?|oz|ounces?|kg|bags?)/i)
    const itemMatch = msg.match(/(?:of\s+)?([a-zA-Z\s]+?)(?:\s+to|\s+in|\s*$)/i)
    
    if (quantityMatch && itemMatch) {
      const quantity = parseInt(quantityMatch[1])
      const unit = quantityMatch[2].toLowerCase()
      const itemName = itemMatch[1].trim()
      
      return `Great! I'll help you add **${quantity} ${unit}** of **${itemName}** to inventory.

Please confirm or provide any missing details:
- **Category**: (Meat, Dairy, Vegetables, Fruits, etc.)
- **Cost per unit**: 
- **Minimum stock level**:

\`\`\`json
{"action": "add_inventory", "data": {"name": "${itemName}", "category": "Vegetables", "quantity": ${quantity}, "unit": "${unit}", "cost": 0, "minStock": 5, "supplier": "Unknown"}}
\`\`\`

*Click "Confirm" to add, or "Edit" to make changes.*`
    }
    
    return `I'd love to help you add inventory! Please provide:

• **Item name** (e.g., "Ground Beef")
• **Quantity** (e.g., "10")
• **Unit** (e.g., "lbs", "cases", "cans")
• **Category** (Meat, Dairy, Vegetables, Fruits, etc.)

Example: "Add 10 lbs of ground beef to meat category"`
  }
  
  // Employee related
  if (msg.includes('add') && (msg.includes('employee') || msg.includes('hire') || msg.includes('new') && (msg.includes('cook') || msg.includes('server') || msg.includes('worker')))) {
    const nameMatch = msg.match(/named?\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i)
    const positionMatch = msg.match(/(cook|server|cashier|manager|dishwasher|kitchen|front.?desk|delivery|barista)/i)
    const rateMatch = msg.match(/\$?(\d+(?:\.\d{2})?)\s*(?:\/hr|per\s*hour|hourly)?/i)
    
    if (nameMatch) {
      const name = nameMatch[1]
      const position = positionMatch ? positionMatch[1].toLowerCase().replace(/\s/g, '-') : 'kitchen'
      const rate = rateMatch ? parseFloat(rateMatch[1]) : 15.00
      
      return `I'll help you add **${name}** as a new employee!

\`\`\`json
{"action": "add_employee", "data": {"name": "${name}", "email": "${name.toLowerCase().replace(' ', '.')}@restaurant.com", "phone": "", "position": "${position}", "role": "staff", "hourlyRate": ${rate}}}
\`\`\`

*Review the details and click "Confirm" to add, or "Edit" to make changes.*`
    }
    
    return `I can help you add a new employee! Please provide:

• **Name** (e.g., "John Smith")
• **Position** (Kitchen, Server, Cashier, Manager, etc.)
• **Email** 
• **Hourly rate**

Example: "Hire John Smith as a kitchen cook at $16/hour"`
  }

  // Schedule related
  if (msg.includes('schedule') || msg.includes('shift')) {
    return `I can help with scheduling! Here's what I can do:

📅 **Schedule Management:**
• Go to the **Schedule** page to view/edit shifts
• Click **"AI Schedule"** to auto-generate next week's schedule
• Click **"Add Shift"** to manually create shifts

👥 **For Employees:**
• Submit availability by clicking **"Submit Availability"**
• Do this every weekend for the next week

🤖 **AI Features:**
• AI can generate optimal schedules based on availability
• AI considers positions, hours, and fair distribution

Would you like me to help you create a specific shift?`
  }
  
  // Low stock
  if (msg.includes('low stock') || msg.includes('running low') || msg.includes('out of')) {
    return `To check low stock items, visit the **Alerts** page in the sidebar. 

I can help you add items that are running low! Just tell me:
- What item you need to order
- How much you want to add

Example: "Add 20 lbs of chicken breast"`
  }

  // Hours/timesheet
  if (msg.includes('hours') || msg.includes('timesheet') || msg.includes('clock')) {
    return `⏱️ **Timesheet Management:**

• Go to the **Timesheet** page to view all entries
• **Clock In** employees at the start of their shift
• **Clock Out** when they're done
• **Managers** can approve pending timesheets

I can also help you understand employee hours. What would you like to know?`
  }
  
  // Default response
  return `Hi! I'm your FoodStock AI assistant. I can help you:

📦 **Inventory**
• Add items: "Add 24 cans of tomatoes"
• Check stock: "What items are running low?"

👥 **Employees**
• Add staff: "Hire John as a cook at $16/hour"
• Manage team: "Show me all kitchen staff"

📅 **Scheduling**
• Create shifts: "Schedule Sarah for Monday 9-5"
• AI scheduling: Use the "AI Schedule" button

⏱️ **Timesheets**
• Track hours: "How many hours did John work?"

Just tell me what you need! 🍽️`
}
