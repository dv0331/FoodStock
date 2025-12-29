'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock, 
  Play, 
  Square,
  CheckCircle,
  XCircle,
  Calendar,
  User,
  Coffee,
  Timer,
  Filter
} from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import { useEmployee } from '../context/EmployeeContext'
import { useAuth } from '../context/AuthContext'
import { format, parseISO, differenceInMinutes, startOfWeek, endOfWeek, eachDayOfInterval } from 'date-fns'

function TimesheetContent() {
  const { 
    employees, 
    timesheets,
    positions,
    clockIn,
    clockOut,
    approveTimesheet,
    getActiveTimesheet,
    getEmployeeById,
    getPositionById,
    calculateHoursWorked,
    getPendingApprovals,
    getTodayTimesheets,
    isLoaded 
  } = useEmployee()

  const { currentUser } = useAuth()

  const [selectedEmployee, setSelectedEmployee] = useState('all')
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0])
  const [isClockInModalOpen, setIsClockInModalOpen] = useState(false)
  const [clockInData, setClockInData] = useState({ employeeId: '', position: '' })
  const [viewMode, setViewMode] = useState('today') // today, week, pending

  const isManager = currentUser?.role === 'manager' || currentUser?.role === 'admin'

  // Get filtered timesheets
  const getFilteredTimesheets = () => {
    let filtered = [...timesheets]
    
    if (viewMode === 'today') {
      const today = new Date().toISOString().split('T')[0]
      filtered = filtered.filter(ts => ts.date === today)
    } else if (viewMode === 'pending') {
      filtered = filtered.filter(ts => ts.status === 'pending-approval')
    } else if (viewMode === 'week') {
      const weekStart = startOfWeek(new Date())
      const weekEnd = endOfWeek(new Date())
      filtered = filtered.filter(ts => {
        const date = parseISO(ts.date)
        return date >= weekStart && date <= weekEnd
      })
    }
    
    if (selectedEmployee !== 'all') {
      filtered = filtered.filter(ts => ts.employeeId === selectedEmployee)
    }
    
    return filtered.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date)
      return (b.clockIn || '').localeCompare(a.clockIn || '')
    })
  }

  const filteredTimesheets = getFilteredTimesheets()
  const pendingCount = getPendingApprovals().length
  const todayTimesheets = getTodayTimesheets()
  const clockedInCount = todayTimesheets.filter(ts => ts.status === 'clocked-in').length

  const handleClockIn = () => {
    if (clockInData.employeeId && clockInData.position) {
      clockIn(clockInData.employeeId, clockInData.position)
      setIsClockInModalOpen(false)
      setClockInData({ employeeId: '', position: '' })
    }
  }

  const handleClockOut = (timesheetId) => {
    clockOut(timesheetId)
  }

  const handleApprove = (timesheetId) => {
    approveTimesheet(timesheetId, currentUser?.id)
  }

  const formatTime = (time) => {
    if (!time) return '--:--'
    const [h, m] = time.split(':')
    const hour = parseInt(h)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'clocked-in':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" /> Working
        </span>
      case 'pending-approval':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
          Pending Approval
        </span>
      case 'approved':
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 flex items-center gap-1">
          <CheckCircle className="w-3 h-3" /> Approved
        </span>
      default:
        return <span className="px-2 py-1 rounded-full text-xs font-medium bg-sage-100 text-sage-700">
          {status}
        </span>
    }
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
            <Clock className="w-8 h-8 text-brand-500" />
            Timesheet
          </h1>
          <p className="text-sage-500 mt-1">Track employee hours and approve timesheets</p>
        </div>
        <Button icon={Play} onClick={() => setIsClockInModalOpen(true)}>
          Clock In Employee
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className={viewMode === 'today' ? 'ring-2 ring-brand-500' : ''}>
          <button 
            onClick={() => setViewMode('today')}
            className="w-full text-center"
          >
            <p className="text-2xl font-bold text-sage-900">{todayTimesheets.length}</p>
            <p className="text-sm text-sage-500">Today's Entries</p>
          </button>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">{clockedInCount}</p>
            <p className="text-sm text-sage-500">Currently Working</p>
          </div>
        </Card>
        <Card className={viewMode === 'pending' ? 'ring-2 ring-brand-500' : ''}>
          <button 
            onClick={() => setViewMode('pending')}
            className="w-full text-center"
          >
            <p className="text-2xl font-bold text-amber-600">{pendingCount}</p>
            <p className="text-sm text-sage-500">Pending Approval</p>
          </button>
        </Card>
        <Card className={viewMode === 'week' ? 'ring-2 ring-brand-500' : ''}>
          <button 
            onClick={() => setViewMode('week')}
            className="w-full text-center"
          >
            <p className="text-2xl font-bold text-sage-900">
              {timesheets.filter(ts => {
                const weekStart = startOfWeek(new Date())
                return parseISO(ts.date) >= weekStart
              }).reduce((sum, ts) => sum + calculateHoursWorked(ts), 0).toFixed(1)}
            </p>
            <p className="text-sm text-sage-500">Hours This Week</p>
          </button>
        </Card>
      </motion.div>

      {/* Filters */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-sage-600">View:</span>
              <div className="flex gap-1">
                {['today', 'week', 'pending'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`
                      px-3 py-1.5 rounded-lg text-sm font-medium transition-all
                      ${viewMode === mode 
                        ? 'bg-brand-500 text-white' 
                        : 'bg-sage-100 text-sage-600 hover:bg-sage-200'}
                    `}
                  >
                    {mode === 'today' ? 'Today' : mode === 'week' ? 'This Week' : 'Pending'}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex-1">
              <Select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                options={[
                  { value: 'all', label: 'All Employees' },
                  ...employees.map(e => ({ value: e.id, label: e.name }))
                ]}
              />
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Timesheets List */}
      {filteredTimesheets.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card>
            <EmptyState
              icon={Clock}
              title="No timesheets found"
              description={viewMode === 'pending' 
                ? "No timesheets pending approval" 
                : "No timesheet entries for this period"}
            />
          </Card>
        </motion.div>
      ) : (
        <motion.div variants={containerVariants} className="space-y-3">
          {filteredTimesheets.map((timesheet) => {
            const employee = getEmployeeById(timesheet.employeeId)
            const position = getPositionById(timesheet.position)
            const hours = calculateHoursWorked(timesheet)
            
            return (
              <motion.div key={timesheet.id} variants={itemVariants}>
                <Card hover>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${position?.color}20` }}
                      >
                        {position?.icon || '👤'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-sage-900">{employee?.name || 'Unknown'}</h3>
                          {getStatusBadge(timesheet.status)}
                        </div>
                        <div className="flex items-center gap-4 text-sm text-sage-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {format(parseISO(timesheet.date), 'MMM d, yyyy')}
                          </span>
                          <span>{position?.name}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="grid grid-cols-3 gap-6 text-center">
                        <div>
                          <p className="text-xs text-sage-500">Clock In</p>
                          <p className="font-semibold text-sage-900">{formatTime(timesheet.clockIn)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-sage-500">Clock Out</p>
                          <p className="font-semibold text-sage-900">{formatTime(timesheet.clockOut)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-sage-500">Hours</p>
                          <p className="font-semibold text-brand-600">{hours.toFixed(2)}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {timesheet.status === 'clocked-in' && (
                          <Button 
                            variant="secondary" 
                            size="sm" 
                            icon={Square}
                            onClick={() => handleClockOut(timesheet.id)}
                          >
                            Clock Out
                          </Button>
                        )}
                        {timesheet.status === 'pending-approval' && isManager && (
                          <Button 
                            size="sm" 
                            icon={CheckCircle}
                            onClick={() => handleApprove(timesheet.id)}
                          >
                            Approve
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Clock In Modal */}
      <Modal
        isOpen={isClockInModalOpen}
        onClose={() => setIsClockInModalOpen(false)}
        title="Clock In Employee"
        size="sm"
      >
        <div className="space-y-4">
          <Select
            label="Employee"
            value={clockInData.employeeId}
            onChange={(e) => setClockInData(prev => ({ ...prev, employeeId: e.target.value }))}
            options={[
              { value: '', label: 'Select Employee...' },
              ...employees.filter(e => !getActiveTimesheet(e.id)).map(e => ({
                value: e.id,
                label: e.name
              }))
            ]}
          />
          <Select
            label="Position/Station"
            value={clockInData.position}
            onChange={(e) => setClockInData(prev => ({ ...prev, position: e.target.value }))}
            options={[
              { value: '', label: 'Select Position...' },
              ...positions.map(p => ({ value: p.id, label: `${p.icon} ${p.name}` }))
            ]}
          />
          <Button 
            fullWidth 
            icon={Play}
            onClick={handleClockIn}
            disabled={!clockInData.employeeId || !clockInData.position}
          >
            Clock In Now
          </Button>
          <p className="text-xs text-sage-500 text-center">
            Current time: {format(new Date(), 'h:mm a')}
          </p>
        </div>
      </Modal>
    </motion.div>
  )
}

export default function TimesheetPage() {
  return (
    <PageWrapper>
      <TimesheetContent />
    </PageWrapper>
  )
}

