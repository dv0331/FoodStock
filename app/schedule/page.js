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
  Loader2,
  Edit2,
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
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
    tasks,
    schedules,
    availabilities,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    bulkAddSchedules,
    clearWeekSchedules,
    submitAvailability,
    getEmployeeAvailability,
    getAllAvailabilitiesForWeek,
    getPositionById,
    getTasksForPosition,
    isLoaded 
  } = useEmployee()

  const { currentUser } = useAuth()

  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date()
    return startOfWeek(today)
  })

  const [selectedEmployee, setSelectedEmployee] = useState('')
  const [isAddShiftModalOpen, setIsAddShiftModalOpen] = useState(false)
  const [isEditShiftModalOpen, setIsEditShiftModalOpen] = useState(false)
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false)
  const [isAIModalOpen, setIsAIModalOpen] = useState(false)
  const [isAIReviewModalOpen, setIsAIReviewModalOpen] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [aiMessage, setAiMessage] = useState('')
  const [generatedSchedules, setGeneratedSchedules] = useState([])
  const [selectedShift, setSelectedShift] = useState(null)
  
  const [shiftData, setShiftData] = useState({
    employeeId: '',
    position: '',
    date: '',
    startTime: '09:00',
    endTime: '17:00',
    tasks: [],
    customTask: '',
    notes: ''
  })

  const [myAvailability, setMyAvailability] = useState({})

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin'

  const weekDays = eachDayOfInterval({
    start: currentWeekStart,
    end: endOfWeek(currentWeekStart)
  })

  const weekStartStr = format(currentWeekStart, 'yyyy-MM-dd')
  const nextWeekStartStr = format(addDays(currentWeekStart, 7), 'yyyy-MM-dd')

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

  // When position changes, load default tasks
  useEffect(() => {
    if (shiftData.position) {
      const positionTasks = getTasksForPosition(shiftData.position)
      setShiftData(prev => ({ ...prev, tasks: positionTasks || [] }))
    }
  }, [shiftData.position])

  const handleAddShift = () => {
    if (shiftData.employeeId && shiftData.date && shiftData.startTime && shiftData.endTime) {
      addSchedule({
        employeeId: shiftData.employeeId,
        position: shiftData.position,
        date: shiftData.date,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        tasks: shiftData.tasks,
        customTask: shiftData.customTask,
        notes: shiftData.notes
      })
      resetShiftForm()
      setIsAddShiftModalOpen(false)
    }
  }

  const handleEditShift = () => {
    if (selectedShift && shiftData.employeeId && shiftData.date) {
      updateSchedule(selectedShift.id, {
        employeeId: shiftData.employeeId,
        position: shiftData.position,
        date: shiftData.date,
        startTime: shiftData.startTime,
        endTime: shiftData.endTime,
        tasks: shiftData.tasks,
        customTask: shiftData.customTask,
        notes: shiftData.notes
      })
      resetShiftForm()
      setIsEditShiftModalOpen(false)
      setSelectedShift(null)
    }
  }

  const handleDeleteShift = (shiftId) => {
    if (confirm('Are you sure you want to delete this shift?')) {
      deleteSchedule(shiftId)
    }
  }

  const openEditModal = (shift) => {
    setSelectedShift(shift)
    setShiftData({
      employeeId: shift.employeeId,
      position: shift.position,
      date: shift.date,
      startTime: shift.startTime,
      endTime: shift.endTime,
      tasks: shift.tasks || [],
      customTask: shift.customTask || '',
      notes: shift.notes || ''
    })
    setIsEditShiftModalOpen(true)
  }

  const resetShiftForm = () => {
    setShiftData({
      employeeId: '',
      position: '',
      date: '',
      startTime: '09:00',
      endTime: '17:00',
      tasks: [],
      customTask: '',
      notes: ''
    })
  }

  const handleSubmitAvailability = () => {
    submitAvailability(currentUser?.id, nextWeekStartStr, {
      days: myAvailability
    })
    setIsAvailabilityModalOpen(false)
    alert('✅ Availability submitted successfully for next week!')
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
      const weekAvailabilities = getAllAvailabilitiesForWeek(nextWeekStartStr)
      
      // Prepare data for AI
      const employeeData = employees.map(emp => ({
        id: emp.id,
        name: emp.name,
        position: emp.position,
        hourlyRate: emp.hourlyRate,
        availability: weekAvailabilities.find(a => a.employeeId === emp.id)?.days || {}
      }))

      setAiMessage('Calling AI to generate optimal schedule...')

      // Call AI API
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          employees: employeeData,
          positions: positions,
          weekStartDate: nextWeekStartStr,
          tasks: tasks
        })
      })

      const data = await response.json()
      
      if (data.schedules && data.schedules.length > 0) {
        setGeneratedSchedules(data.schedules)
        setAiMessage('Schedule generated! Please review...')
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsAIModalOpen(false)
        setIsAIReviewModalOpen(true)
      } else {
        // Fallback to local generation if API fails
        setAiMessage('Creating schedule locally...')
        const localSchedules = generateLocalSchedule()
        setGeneratedSchedules(localSchedules)
        await new Promise(resolve => setTimeout(resolve, 1000))
        setIsAIModalOpen(false)
        setIsAIReviewModalOpen(true)
      }
      
    } catch (error) {
      console.error('AI Schedule Error:', error)
      setAiMessage('Using local schedule generation...')
      const localSchedules = generateLocalSchedule()
      setGeneratedSchedules(localSchedules)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setIsAIModalOpen(false)
      setIsAIReviewModalOpen(true)
    } finally {
      setIsGenerating(false)
    }
  }

  const generateLocalSchedule = () => {
    const schedules = []
    const weekStart = addDays(currentWeekStart, 7) // Next week
    
    employees.forEach((emp, empIdx) => {
      // Give each employee 4-5 shifts per week
      const numShifts = 4 + Math.floor(Math.random() * 2)
      const assignedDays = new Set()
      
      for (let i = 0; i < numShifts; i++) {
        let dayIdx
        do {
          dayIdx = Math.floor(Math.random() * 7)
        } while (assignedDays.has(dayIdx) && assignedDays.size < 7)
        
        assignedDays.add(dayIdx)
        
        const date = format(addDays(weekStart, dayIdx), 'yyyy-MM-dd')
        const startHour = 7 + Math.floor(Math.random() * 5) // 7 AM - 12 PM start
        const shiftLength = 6 + Math.floor(Math.random() * 3) // 6-8 hours
        const position = emp.position || positions[Math.floor(Math.random() * positions.length)].id
        
        schedules.push({
          employeeId: emp.id,
          employeeName: emp.name,
          position: position,
          date,
          startTime: `${String(startHour).padStart(2, '0')}:00`,
          endTime: `${String(Math.min(startHour + shiftLength, 23)).padStart(2, '0')}:00`,
          tasks: getTasksForPosition(position),
          notes: `Auto-generated shift for ${emp.name}`
        })
      }
    })
    
    return schedules.sort((a, b) => a.date.localeCompare(b.date))
  }

  const applyGeneratedSchedule = () => {
    // Clear existing schedules for next week
    clearWeekSchedules(nextWeekStartStr)
    
    // Add new schedules
    const schedulesToAdd = generatedSchedules.map(s => ({
      employeeId: s.employeeId,
      position: s.position,
      date: s.date,
      startTime: s.startTime,
      endTime: s.endTime,
      tasks: s.tasks || [],
      notes: s.notes || 'AI Generated'
    }))
    
    bulkAddSchedules(schedulesToAdd)
    setGeneratedSchedules([])
    setIsAIReviewModalOpen(false)
    
    // Jump to next week
    setCurrentWeekStart(addDays(currentWeekStart, 7))
  }

  const removeFromGenerated = (index) => {
    setGeneratedSchedules(prev => prev.filter((_, i) => i !== index))
  }

  const formatTimeSlot = (time) => {
    if (!time) return '--'
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

  const ShiftForm = ({ onSubmit, submitLabel }) => (
    <div className="space-y-4">
      <Select
        label="Employee"
        value={shiftData.employeeId}
        onChange={(e) => {
          const emp = employees.find(emp => emp.id === e.target.value)
          setShiftData(prev => ({ 
            ...prev, 
            employeeId: e.target.value,
            position: emp?.position || prev.position
          }))
        }}
        options={[
          { value: '', label: 'Select Employee...' },
          ...employees.map(e => ({ value: e.id, label: e.name }))
        ]}
      />
      
      <Select
        label="Position/Station"
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

      {/* Task Assignment */}
      <div>
        <label className="block text-sm font-medium text-sage-700 mb-2">
          <FileText className="w-4 h-4 inline mr-1" />
          Tasks & Responsibilities
        </label>
        <div className="bg-sage-50 rounded-xl p-3 space-y-2 max-h-32 overflow-y-auto">
          {shiftData.tasks.length > 0 ? (
            shiftData.tasks.map((task, idx) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-sage-700">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{task}</span>
              </div>
            ))
          ) : (
            <p className="text-sm text-sage-400">Select a position to see default tasks</p>
          )}
        </div>
      </div>

      <Input
        label="Custom Task / Additional Instructions"
        value={shiftData.customTask}
        onChange={(e) => setShiftData(prev => ({ ...prev, customTask: e.target.value }))}
        placeholder="e.g., Train new employee, Deep clean station..."
      />

      <Input
        label="Notes"
        value={shiftData.notes}
        onChange={(e) => setShiftData(prev => ({ ...prev, notes: e.target.value }))}
        placeholder="Any additional notes..."
      />
      
      <Button fullWidth icon={submitLabel === 'Add Shift' ? Plus : Check} onClick={onSubmit}>
        {submitLabel}
      </Button>
    </div>
  )

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
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setIsAvailabilityModalOpen(true)}>
            📅 Submit Availability
          </Button>
          {isManager && (
            <>
              <Button variant="secondary" icon={Wand2} onClick={() => setIsAIModalOpen(true)}>
                🤖 AI Schedule
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

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-sage-900">{weekSchedules.length}</p>
            <p className="text-sm text-sage-500">Shifts This Week</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {new Set(weekSchedules.map(s => s.employeeId)).size}
            </p>
            <p className="text-sm text-sage-500">Employees Scheduled</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-blue-600">
              {getAllAvailabilitiesForWeek(nextWeekStartStr).length}
            </p>
            <p className="text-sm text-sage-500">Availability Submitted</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-sage-900">{positions.length}</p>
            <p className="text-sm text-sage-500">Positions Available</p>
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
            <div className="min-w-[900px]">
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
                            className="min-h-[70px] p-1"
                          >
                            {daySchedules.map((sched) => {
                              const schedPosition = getPositionById(sched.position)
                              return (
                                <div 
                                  key={sched.id}
                                  className="text-xs p-2 rounded-lg mb-1 cursor-pointer hover:opacity-80 transition-opacity group relative"
                                  style={{ 
                                    backgroundColor: `${schedPosition?.color}20`,
                                    borderLeft: `3px solid ${schedPosition?.color}`
                                  }}
                                  onClick={() => isManager && openEditModal(sched)}
                                >
                                  <p className="font-medium text-sage-900">
                                    {formatTimeSlot(sched.startTime)} - {formatTimeSlot(sched.endTime)}
                                  </p>
                                  <p className="text-sage-600 truncate">{schedPosition?.name}</p>
                                  {sched.customTask && (
                                    <p className="text-sage-400 truncate text-[10px] mt-0.5">
                                      📝 {sched.customTask}
                                    </p>
                                  )}
                                  {isManager && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleDeleteShift(sched.id); }}
                                      className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 
                                        p-1 rounded bg-red-100 hover:bg-red-200 transition-all"
                                    >
                                      <Trash2 className="w-3 h-3 text-red-500" />
                                    </button>
                                  )}
                                </div>
                              )
                            })}
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
        onClose={() => { setIsAddShiftModalOpen(false); resetShiftForm(); }}
        title="Add Shift"
        size="md"
      >
        <ShiftForm onSubmit={handleAddShift} submitLabel="Add Shift" />
      </Modal>

      {/* Edit Shift Modal */}
      <Modal
        isOpen={isEditShiftModalOpen}
        onClose={() => { setIsEditShiftModalOpen(false); resetShiftForm(); setSelectedShift(null); }}
        title="Edit Shift"
        size="md"
      >
        <ShiftForm onSubmit={handleEditShift} submitLabel="Save Changes" />
      </Modal>

      {/* Availability Modal */}
      <Modal
        isOpen={isAvailabilityModalOpen}
        onClose={() => setIsAvailabilityModalOpen(false)}
        title="📅 Submit Your Availability"
        size="lg"
      >
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
            <p className="text-sm text-blue-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              <strong>Submit by Sunday</strong> for next week: {format(addDays(currentWeekStart, 7), 'MMM d')} - {format(addDays(currentWeekStart, 13), 'MMM d')}
            </p>
          </div>
          
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
              
              {['Morning (6AM-12PM)', 'Afternoon (12PM-6PM)', 'Evening (6PM-11PM)'].map((slot) => (
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
            Submit Availability for Next Week
          </Button>
        </div>
      </Modal>

      {/* AI Schedule Modal */}
      <Modal
        isOpen={isAIModalOpen}
        onClose={() => !isGenerating && setIsAIModalOpen(false)}
        title="🤖 AI Schedule Generator"
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
                  AI will create an optimal schedule for <strong>next week</strong> based on:
                </p>
              </div>
              
              <div className="bg-sage-50 rounded-xl p-4 text-left">
                <ul className="text-sm text-sage-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Employee submitted availability
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Position requirements and skills
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Fair distribution of hours
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-500" />
                    Automatic task assignment
                  </li>
                </ul>
              </div>

              <p className="text-xs text-sage-500">
                {getAllAvailabilitiesForWeek(nextWeekStartStr).length} employees have submitted availability
              </p>
              
              <Button fullWidth icon={Wand2} onClick={generateAISchedule}>
                Generate Schedule for Next Week
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

      {/* AI Review Modal */}
      <Modal
        isOpen={isAIReviewModalOpen}
        onClose={() => setIsAIReviewModalOpen(false)}
        title="📋 Review AI Generated Schedule"
        size="xl"
      >
        <div className="space-y-4">
          <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
            <p className="text-sm text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              Review the schedule below. You can remove shifts or apply the schedule.
            </p>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {generatedSchedules.map((sched, idx) => {
              const emp = employees.find(e => e.id === sched.employeeId)
              const pos = getPositionById(sched.position)
              return (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-3 bg-sage-50 rounded-xl"
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                      style={{ backgroundColor: `${pos?.color}20` }}
                    >
                      {pos?.icon}
                    </div>
                    <div>
                      <p className="font-medium text-sage-900">{emp?.name || sched.employeeName}</p>
                      <p className="text-sm text-sage-500">
                        {pos?.name} • {format(parseISO(sched.date), 'EEE, MMM d')} • {formatTimeSlot(sched.startTime)} - {formatTimeSlot(sched.endTime)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFromGenerated(idx)}
                    className="p-2 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </button>
                </div>
              )
            })}
          </div>

          <div className="flex gap-3 pt-4 border-t border-sage-200">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={() => setIsAIReviewModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              fullWidth 
              icon={CheckCircle}
              onClick={applyGeneratedSchedule}
              disabled={generatedSchedules.length === 0}
            >
              Apply {generatedSchedules.length} Shifts
            </Button>
          </div>
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
