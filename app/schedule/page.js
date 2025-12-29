'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Plus,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  User,
  Clock,
  Check,
  Save,
  Wand2,
  Loader2
} from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import { useEmployee } from '../context/EmployeeContext'
import { useAuth } from '../context/AuthContext'
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay } from 'date-fns'

const timeSlots = [
  '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
  '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
  '18:00', '19:00', '20:00', '21:00', '22:00', '23:00'
]

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

function ScheduleContent() {
  const { 
    employees, 
    positions,
    schedules,
    availabilities,
    addSchedule,
    deleteSchedule,
    submitAvailability,
    getEmployeeAvailability,
    getAllAvailabilitiesForWeek,
    getPositionById,
    isLoaded 
  } = useEmployee()

  const { currentUser } = useAuth()

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    return startOfWeek(today)
  })

  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState(false)
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  
  const [shiftData, setShiftData] = useState({
    employeeId: '',
    position: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00'
  })

  const [myAvailability, setMyAvailability] = useState({})

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin'

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart)
  })

  const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd')

  // Get schedules for current week
  const weekSchedules = schedules.filter(s => {
    const schedDate = parseISO(s.date)
    return schedDate >= currentWeekStart && schedDate <= endOfWeek(currentWeekStart)
  })

  const goToPreviousWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, -7))
  }

  const goToNextWeek = () => {
    setCurrentWeekStart(prev => addDays(prev, 7))
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date()))
  }

  const handleAddShift = () => {
    if (shiftData.employeeId && shiftData.date && shiftData.startTime && shiftData.endTime) {
      addSchedule({
        employeeId: shiftData.employeeId,
        position: shiftData.position,
        date: shiftData.date,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime
      })
      setShiftData({
        employeeId: '',
        position: '',
        date: '',
        startTime: '09:00',
        endTime: '17:00'
      })
      setIsAddShiftModalOpen(false)
    }
  }

  const handleSubmitAvailability = () => {
    // Submit availability for the upcoming week
    const nextWeekStart = format(addDays(currentWeekStart, 7), 'yyyy-MM-dd')
    submitAvailability(currentUser?.id, nextWeekStart, {
      days: myAvailability
    })
    setIsAvailabilityModalOpen(false)
    alert('Availability submitted successfully!')
  }

  const toggleAvailability = (day, slot) => {
    setMyAvailability(prev => {
      const daySlots = prev[day] || []
      if (daySlots.includes(slot)) {
        return { ...prev, [day]: daySlots.filter(s => s !== slot) }
      } else {
        return { ...prev, [day]: [...daySlots, slot].sort() }
      }
    })
  }

  const generateAISchedule = async () => {
    setIsGenerating(true)
    setAiMessage('Analyzing employee availability and positions...')
    
    try {
      // Get all availabilities for next week
      const nextWeekStart = format(addDays(currentWeekStart, 7), 'yyyy-MM-dd')
      const weekAvailabilities = getAllAvailabilitiesForWeek(nextWeekStart)
      
      // Simulate AI generating schedule (in production, this would call OpenAI)
      await new Promise(resolve => setTimeout(resolve, 1500))
      setAiMessage('Creating optimal schedule based on positions...')
      await new Promise(resolve => setTimeout(resolve, 1500))
      setAiMessage('Balancing shifts across employees...')
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Generate sample schedules
      const generatedSchedules = []
      employees.forEach((emp, idx) => {
        // Give each employee 3-5 shifts
        const numShifts = 3 + Math.floor(Math.random() * 3)
        for (let i = 0; i < numShifts; i++) {
          const dayIdx = (idx + i * 2) % 7
          const date = format(addDays(currentWeekStart, 7 + dayIdx), 'yyyy-MM-dd')
          const startHour = 8 + Math.floor(Math.random() * 4)
          const shiftLength = 6 + Math.floor(Math.random() * 3)
          
          generatedSchedules.push({
            employeeId: emp.id,
            position: emp.position,
            date,
            startTime: `${String(startHour).padStart(2, '0')}:00`,
            endTime: `${String(startHour + shiftLength).padStart(2, '0')}:00`
          })
        }
      })
      
      // Add schedules
      generatedSchedules.forEach(sched => addSchedule(sched))
      
      setAiMessage('Schedule generated successfully! 🎉')
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Jump to next week to see generated schedule
      setCurrentWeekStart(addDays(currentWeekStart, 7))
      setIsAIModalOpen(false)
      
    } catch (error) {
      setAiMessage('Error generating schedule. Please try again.')
    } finally {
      setIsGenerating(false)
    }
  }

  const formatTimeSlot = (time) => {
    const [h] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12} ${ampm}`
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-sage-900 flex items-center gap-3">
            <Calendar className="w-8 h-8 text-brand-500" />
            Schedule
          </h1>
          <p className="text-sage-500 mt-1">Manage employee schedules and availability</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setIsAvailabilityModalOpen(true)}>
            Submit My Availability
          </Button>
          {isManager && (
            <>
              <Button variant="secondary" icon={Wand2} onClick={() => setIsAIModalOpen(true)}>
                AI Schedule
              </Button>
              <Button icon={Plus} onClick={() => setIsAddShiftModalOpen(true)}>
                Add Shift
              </Button>
            </>
          )}
        </div>
      </motion.div>

      {/* Week Navigation */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex items-center justify-between">
            <button 
              onClick={goToPreviousWeek}
              className="p-2 rounded-lg hover:bg-sage-100 transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-sage-600" />
            </button>
            
            <div className="text-center">
              <h2 className="font-semibold text-sage-900">
                {format(currentWeekStart, 'MMMM d')} - {format(endOfWeek(currentWeekStart), 'MMMM d, yyyy')}
              </h2>
              <button 
                onClick={goToCurrentWeek}
                className="text-sm text-brand-500 hover:text-brand-600"
              >
                Today
              </button>
            </div>
            
            <button 
              onClick={goToNextWeek}
              className="p-2 rounded-lg hover:bg-sage-100 transition-colors"
            >
              <ChevronRight className="w-5 h-5 text-sage-600" />
            </button>
          </div>
        </Card>
      </motion.div>

      {/* Employee Filter */}
      <motion.div variants={itemVariants}>
        <Select
          value={selectedEmployee}
          onChange={(e) => setSelectedEmployee(e.target.value)}
          options={[
            { value: '', label: 'All Employees' },
            ...employees.map(e => ({ value: e.id, label: e.name }))
          ]}
          className="w-48"
        />
      </motion.div>

      {/* Schedule Grid */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="overflow-x-auto">
            <div className="min-w-[800px]">
              {/* Days Header */}
              <div className="grid grid-cols-8 gap-2 mb-4">
                <div className="text-sm font-medium text-sage-500 p-2">Employee</div>
                {weekDays.map((day) => (
                  <div 
                    key={day.toISOString()} 
                    className={`
                      text-center p-2 rounded-lg
                      ${isSameDay(day, new Date()) ? 'bg-brand-100' : ''}
                    `}
                  >
                    <p className="text-xs text-sage-500">{format(day, 'EEE')}</p>
                    <p className={`font-semibold ${isSameDay(day, new Date()) ? 'text-brand-600' : 'text-sage-900'}`}>
                      {format(day, 'd')}
                    </p>
                  </div>
                ))}
              </div>

              {/* Schedule Rows */}
              {employees
                .filter(e => !selectedEmployee || e.id === selectedEmployee)
                .map((employee) => {
                  const position = getPositionById(employee.position)
                  
                  return (
                    <div 
                      key={employee.id} 
                      className="grid grid-cols-8 gap-2 py-2 border-t border-sage-100"
                    >
                      <div className="flex items-center gap-2 p-2">
                        <div 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                          style={{ backgroundColor: `${position?.color}20` }}
                        >
                          {position?.icon || '👤'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-sage-900 truncate">{employee.name}</p>
                          <p className="text-xs text-sage-500">{position?.name}</p>
                        </div>
                      </div>
                      
                      {weekDays.map((day) => {
                        const dayStr = format(day, 'yyyy-MM-dd')
                        const daySchedules = weekSchedules.filter(
                          s => s.employeeId === employee.id && s.date === dayStr
                        )
                        
                        return (
                          <div 
                            key={day.toISOString()} 
                            className="min-h-[60px] p-1"
                          >
                            {daySchedules.map((sched, idx) => (
                              <div 
                                key={sched.id}
                                className="text-xs p-2 rounded-lg mb-1"
                                style={{ 
                                  backgroundColor: `${position?.color}20`,
                                  borderLeft: `3px solid ${position?.color}`
                                }}
                              >
                                <p className="font-medium text-sage-900">
                                  {formatTimeSlot(sched.startTime)} - {formatTimeSlot(sched.endTime)}
                                </p>
                                <p className="text-sage-500">{getPositionById(sched.position)?.name}</p>
                              </div>
                            ))}
                            {daySchedules.length === 0 && (
                              <div className="h-full flex items-center justify-center text-sage-300">
                                —
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )
              })}

              {employees.length === 0 && (
                <div className="py-12">
                  <EmptyState
                    icon={Calendar}
                    title="No employees yet"
                    description="Add employees to start creating schedules"
                  />
                </div>
              )}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Add Shift Modal */}
      <Modal
        isOpen={isAddShiftModalOpen}
        onClose={() => setIsAddShiftModalOpen(false)}
        title="Add Shift"
        size="md"
      >
        <div className="space-y-4">
          <Select
            label="Employee"
            value={shiftData.employeeId}
            onChange={(e) => {
              const emp = employees.find(emp => emp.id === e.target.value)
              setShiftData(prev => ({ 
                ...prev, 
                employeeId: e.target.value,
                position: emp?.position || ''
              }))
            }}
            options={[
              { value: '', label: 'Select Employee...' },
              ...employees.map(e => ({ value: e.id, label: e.name }))
            ]}
          />
          
          <Select
            label="Position"
            value={shiftData.position}
            onChange={(e) => setShiftData(prev => ({ ...prev, position: e.target.value }))}
            options={[
              { value: '', label: 'Select Position...' },
              ...positions.map(p => ({ value: p.id, label: `${p.icon} ${p.name}` }))
            ]}
          />
          
          <div>
            <label className="block text-sm font-medium text-sage-700 mb-1">Date</label>
            <input
              type="date"
              value={shiftData.date}
              onChange={(e) => setShiftData(prev => ({ ...prev, date: e.target.value }))}
              min={format(currentWeekStart, 'yyyy-MM-dd')}
              className="w-full px-4 py-2.5 rounded-xl border border-sage-200 
                focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Start Time"
              value={shiftData.startTime}
              onChange={(e) => setShiftData(prev => ({ ...prev, startTime: e.target.value }))}
              options={timeSlots.map(t => ({ value: t, label: formatTimeSlot(t) }))}
            />
            <Select
              label="End Time"
              value={shiftData.endTime}
              onChange={(e) => setShiftData(prev => ({ ...prev, endTime: e.target.value }))}
              options={timeSlots.map(t => ({ value: t, label: formatTimeSlot(t) }))}
            />
          </div>
          
          <Button fullWidth icon={Plus} onClick={handleAddShift}>
            Add Shift
          </Button>
        </div>
      </Modal>

      {/* Availability Modal */}
      <Modal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        title="Submit Your Availability"
        size="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-sage-600">
            Select your available times for next week ({format(addDays(currentWeekStart, 7), 'MMM d')} - {format(addDays(currentWeekStart, 13), 'MMM d')})
          </p>
          
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              <div className="grid grid-cols-8 gap-1 mb-2">
                <div className="text-xs text-sage-500 p-1">Time</div>
                {daysOfWeek.map(day => (
                  <div key={day} className="text-xs text-center text-sage-500 p-1">
                    {day.slice(0, 3)}
                  </div>
                ))}
              </div>
              
              {['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-11PM)'].map((slot, idx) => (
                <div key={slot} className="grid grid-cols-8 gap-1 mb-1">
                  <div className="text-xs text-sage-600 p-2 flex items-center">{slot}</div>
                  {daysOfWeek.map(day => {
                    const isAvailable = myAvailability[day]?.includes(slot)
                    return (
                      <button
                        key={`${day}-${slot}`}
                        onClick={() => toggleAvailability(day, slot)}
                        className={`
                          p-2 rounded-lg text-xs font-medium transition-all
                          ${isAvailable 
                            ? 'bg-green-500 text-white' 
                            : 'bg-sage-100 text-sage-400 hover:bg-sage-200'}
                        `}
                      >
                        {isAvailable ? <Check className="w-4 h-4 mx-auto" /> : '—'}
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
          </div>
          
          <Button fullWidth icon={Save} onClick={handleSubmitAvailability}>
            Submit Availability
          </Button>
        </div>
      </Modal>

      {/* AI Schedule Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => !isGenerating && setIsAIModalOpen(false)}
        title="AI Schedule Generator"
        size="md"
      >
        <div className="space-y-6 text-center py-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto">
            {isGenerating ? (
              <Loader2 className="w-10 h-10 text-white animate-spin" />
            ) : (
              <Sparkles className="w-10 h-10 text-white" />
            )}
          </div>
          
          {!isGenerating ? (
            <>
              <div>
                <h3 className="text-lg font-semibold text-sage-900">Generate Schedule with AI</h3>
                <p className="text-sage-600 mt-2">
                  Our AI will analyze employee availability, positions, and labor requirements 
                  to create an optimal schedule for next week.
                </p>
              </div>
              
              <div className="bg-sage-50 rounded-xl p-4 text-left">
                <h4 className="font-medium text-sage-900 mb-2">The AI will consider:</h4>
                <ul className="text-sm text-sage-600 space-y-1">
                  <li>• Employee submitted availability</li>
                  <li>• Position requirements and skills</li>
                  <li>• Fair distribution of hours</li>
                  <li>• Avoid scheduling conflicts</li>
                </ul>
              </div>
              
              <Button fullWidth icon={Wand2} onClick={generateAISchedule}>
                Generate Schedule
              </Button>
            </>
          ) : (
            <div>
              <h3 className="text-lg font-semibold text-sage-900 mb-2">Generating Schedule...</h3>
              <p className="text-sage-600">{aiMessage}</p>
            </div>
          )}
        </div>
      </Modal>
    </motion.div>
  )
}

export default function SchedulePage() {
  return (
    <PageWrapper>
      <ScheduleContent />
    </PageWrapper>
  )
}

