import { NextResponse } from 'next/server'

// API key for OpenAI - Set OPENAI_API_KEY environment variable
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || ''

export async function POST(request) {
  try {
    const { employees, positions, weekStartDate, tasks } = await request.json()

    if (!OPENAI_API_KEY || !employees || employees.length === 0) {
      // Return fallback schedule generation
      return NextResponse.json({
        schedules: generateFallbackSchedule(employees, positions, weekStartDate, tasks)
      })
    }

    const prompt = `You are an AI assistant helping to generate an optimal weekly work schedule for a restaurant.

EMPLOYEES:
${employees.map(e => `- ${e.name} (ID: ${e.id}, Position: ${e.position}, Rate: $${e.hourlyRate}/hr)
  Availability: ${JSON.stringify(e.availability)}`).join('\n')}

POSITIONS AVAILABLE:
${positions.map(p => `- ${p.id}: ${p.name} (${p.icon})`).join('\n')}

WEEK START DATE: ${weekStartDate}

Generate a fair schedule ensuring:
1. Each employee gets 4-5 shifts per week (30-40 hours)
2. Respect employee availability if provided
3. Assign employees to their primary position when possible
4. Cover all days of the week with sufficient staff
5. Shifts should be 6-8 hours

Return a JSON array of shifts in this exact format:
[
  {
    "employeeId": "employee-id",
    "employeeName": "Name",
    "position": "position-id",
    "date": "YYYY-MM-DD",
    "startTime": "HH:00",
    "endTime": "HH:00",
    "tasks": ["task1", "task2"],
    "notes": "optional note"
  }
]

Return ONLY the JSON array, no explanation.`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a helpful assistant that generates work schedules. Always return valid JSON arrays.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    })

    if (!response.ok) {
      throw new Error('OpenAI API error')
    }

    const data = await response.json()
    const content = data.choices[0].message.content

    // Parse JSON from response
    let schedules
    try {
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\[[\s\S]*\]/)
      if (jsonMatch) {
        schedules = JSON.parse(jsonMatch[0])
      } else {
        schedules = JSON.parse(content)
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError)
      schedules = generateFallbackSchedule(employees, positions, weekStartDate, tasks)
    }

    return NextResponse.json({ schedules })

  } catch (error) {
    console.error('Schedule API Error:', error)
    
    // Fallback to local generation
    try {
      const { employees, positions, weekStartDate, tasks } = await request.json()
      return NextResponse.json({
        schedules: generateFallbackSchedule(employees, positions, weekStartDate, tasks)
      })
    } catch {
      return NextResponse.json({ schedules: [] })
    }
  }
}

function generateFallbackSchedule(employees, positions, weekStartDate, tasks) {
  if (!employees || employees.length === 0) return []
  
  const schedules = []
  const startDate = new Date(weekStartDate)
  
  const defaultTasks = {
    kitchen: ['Cook food orders', 'Maintain food quality', 'Keep station clean'],
    'front-desk': ['Greet customers', 'Manage waitlist', 'Answer phone'],
    server: ['Take orders', 'Serve food', 'Check on tables'],
    cashier: ['Process payments', 'Handle cash', 'Answer questions'],
    prep: ['Prep vegetables', 'Portion ingredients', 'Stock prep area'],
    dishwasher: ['Wash dishes', 'Clean kitchen', 'Take out trash'],
    manager: ['Supervise staff', 'Handle complaints', 'Check inventory'],
    delivery: ['Deliver orders', 'Verify orders', 'Handle payments'],
    restocking: ['Check inventory', 'Restock shelves', 'Organize storage'],
    cleaning: ['Clean dining area', 'Sanitize surfaces', 'Clean restrooms'],
  }
  
  employees.forEach((emp) => {
    const numShifts = 4 + Math.floor(Math.random() * 2) // 4-5 shifts
    const assignedDays = new Set()
    
    for (let i = 0; i < numShifts; i++) {
      let dayIdx
      let attempts = 0
      do {
        dayIdx = Math.floor(Math.random() * 7)
        attempts++
      } while (assignedDays.has(dayIdx) && attempts < 10)
      
      if (assignedDays.has(dayIdx)) continue
      assignedDays.add(dayIdx)
      
      const shiftDate = new Date(startDate)
      shiftDate.setDate(startDate.getDate() + dayIdx)
      
      const startHour = 7 + Math.floor(Math.random() * 5) // 7 AM - 12 PM
      const shiftLength = 6 + Math.floor(Math.random() * 3) // 6-8 hours
      const position = emp.position || 'kitchen'
      
      schedules.push({
        employeeId: emp.id,
        employeeName: emp.name,
        position: position,
        date: shiftDate.toISOString().split('T')[0],
        startTime: `${String(startHour).padStart(2, '0')}:00`,
        endTime: `${String(Math.min(startHour + shiftLength, 23)).padStart(2, '0')}:00`,
        tasks: defaultTasks[position] || ['Assigned duties'],
        notes: 'AI Generated Schedule'
      })
    }
  })
  
  return schedules.sort((a, b) => a.date.localeCompare(b.date))
}

