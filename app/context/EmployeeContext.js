'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { v4 as uuidv4 } from 'uuid'

const EmployeeContext = createContext()

// Work positions/stations
const defaultPositions = [
  { id: 'kitchen', name: 'Kitchen', icon: '👨‍🍳', color: '#ef4444' },
  { id: 'front-desk', name: 'Front Desk', icon: '🎫', color: '#3b82f6' },
  { id: 'server', name: 'Server', icon: '🍽️', color: '#22c55e' },
  { id: 'cashier', name: 'Cashier', icon: '💰', color: '#f59e0b' },
  { id: 'prep', name: 'Prep Cook', icon: '🥗', color: '#8b5cf6' },
  { id: 'dishwasher', name: 'Dishwasher', icon: '🧽', color: '#06b6d4' },
  { id: 'manager', name: 'Manager', icon: '📋', color: '#ec4899' },
  { id: 'delivery', name: 'Delivery', icon: '🚗', color: '#14b8a6' },
]

// Sample employees
const sampleEmployees = [
  {
    id: 'emp-1',
    name: 'John Smith',
    email: 'john@foodstock.com',
    phone: '(555) 111-2222',
    position: 'kitchen',
    role: 'staff',
    hourlyRate: 15.00,
    hireDate: '2024-01-15',
    isActive: true,
    avatar: null
  },
  {
    id: 'emp-2',
    name: 'Sarah Johnson',
    email: 'sarah@foodstock.com',
    phone: '(555) 333-4444',
    position: 'front-desk',
    role: 'staff',
    hourlyRate: 14.00,
    hireDate: '2024-02-01',
    isActive: true,
    avatar: null
  },
  {
    id: 'emp-3',
    name: 'Mike Wilson',
    email: 'mike@foodstock.com',
    phone: '(555) 555-6666',
    position: 'manager',
    role: 'manager',
    hourlyRate: 22.00,
    hireDate: '2023-06-15',
    isActive: true,
    avatar: null
  }
]

// Sample timesheets
const sampleTimesheets = [
  {
    id: 'ts-1',
    employeeId: 'emp-1',
    date: new Date().toISOString().split('T')[0],
    clockIn: '09:00',
    clockOut: null,
    breakMinutes: 0,
    position: 'kitchen',
    status: 'clocked-in', // clocked-in, clocked-out, pending-approval, approved
    approvedBy: null,
    notes: ''
  }
]

// Sample schedules
const sampleSchedules = []

// Sample availabilities
const sampleAvailabilities = []

export function EmployeeProvider({ children }) {
  const [employees, setEmployees] = useState([])
  const [timesheets, setTimesheets] = useState([])
  const [schedules, setSchedules] = useState([])
  const [availabilities, setAvailabilities] = useState([])
  const [positions] = useState(defaultPositions)
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data from localStorage
  useEffect(() => {
    const savedEmployees = localStorage.getItem('foodstock_employees')
    const savedTimesheets = localStorage.getItem('foodstock_timesheets')
    const savedSchedules = localStorage.getItem('foodstock_schedules')
    const savedAvailabilities = localStorage.getItem('foodstock_availabilities')

    setEmployees(savedEmployees ? JSON.parse(savedEmployees) : sampleEmployees)
    setTimesheets(savedTimesheets ? JSON.parse(savedTimesheets) : sampleTimesheets)
    setSchedules(savedSchedules ? JSON.parse(savedSchedules) : sampleSchedules)
    setAvailabilities(savedAvailabilities ? JSON.parse(savedAvailabilities) : sampleAvailabilities)
    
    setIsLoaded(true)
  }, [])

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('foodstock_employees', JSON.stringify(employees))
    }
  }, [employees, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('foodstock_timesheets', JSON.stringify(timesheets))
    }
  }, [timesheets, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('foodstock_schedules', JSON.stringify(schedules))
    }
  }, [schedules, isLoaded])

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('foodstock_availabilities', JSON.stringify(availabilities))
    }
  }, [availabilities, isLoaded])

  // Employee CRUD
  const addEmployee = (employeeData) => {
    const newEmployee = {
      ...employeeData,
      id: uuidv4(),
      hireDate: new Date().toISOString().split('T')[0],
      isActive: true
    }
    setEmployees(prev => [...prev, newEmployee])
    return newEmployee
  }

  const updateEmployee = (id, updates) => {
    setEmployees(prev => 
      prev.map(emp => emp.id === id ? { ...emp, ...updates } : emp)
    )
  }

  const deleteEmployee = (id) => {
    setEmployees(prev => prev.filter(emp => emp.id !== id))
  }

  const getEmployeeById = (id) => {
    return employees.find(emp => emp.id === id)
  }

  // Clock In/Out
  const clockIn = (employeeId, position, notes = '') => {
    const now = new Date()
    const timesheet = {
      id: uuidv4(),
      employeeId,
      date: now.toISOString().split('T')[0],
      clockIn: now.toTimeString().slice(0, 5),
      clockOut: null,
      breakMinutes: 0,
      position,
      status: 'clocked-in',
      approvedBy: null,
      notes
    }
    setTimesheets(prev => [...prev, timesheet])
    return timesheet
  }

  const clockOut = (timesheetId) => {
    const now = new Date()
    setTimesheets(prev => 
      prev.map(ts => 
        ts.id === timesheetId 
          ? { ...ts, clockOut: now.toTimeString().slice(0, 5), status: 'pending-approval' }
          : ts
      )
    )
  }

  const approveTimesheet = (timesheetId, approverId) => {
    setTimesheets(prev => 
      prev.map(ts => 
        ts.id === timesheetId 
          ? { ...ts, status: 'approved', approvedBy: approverId }
          : ts
      )
    )
  }

  const getActiveTimesheet = (employeeId) => {
    return timesheets.find(ts => 
      ts.employeeId === employeeId && ts.status === 'clocked-in'
    )
  }

  const getEmployeeTimesheets = (employeeId, startDate, endDate) => {
    return timesheets.filter(ts => {
      if (ts.employeeId !== employeeId) return false
      if (startDate && ts.date < startDate) return false
      if (endDate && ts.date > endDate) return false
      return true
    })
  }

  const getTodayTimesheets = () => {
    const today = new Date().toISOString().split('T')[0]
    return timesheets.filter(ts => ts.date === today)
  }

  const getPendingApprovals = () => {
    return timesheets.filter(ts => ts.status === 'pending-approval')
  }

  // Calculate hours worked
  const calculateHoursWorked = (timesheet) => {
    if (!timesheet.clockIn || !timesheet.clockOut) return 0
    
    const [inH, inM] = timesheet.clockIn.split(':').map(Number)
    const [outH, outM] = timesheet.clockOut.split(':').map(Number)
    
    const inMinutes = inH * 60 + inM
    const outMinutes = outH * 60 + outM
    const totalMinutes = outMinutes - inMinutes - (timesheet.breakMinutes || 0)
    
    return Math.max(0, totalMinutes / 60)
  }

  const getWeeklyHours = (employeeId) => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    
    const employeeTimesheets = timesheets.filter(ts => 
      ts.employeeId === employeeId && 
      ts.date >= weekStart.toISOString().split('T')[0]
    )
    
    return employeeTimesheets.reduce((total, ts) => total + calculateHoursWorked(ts), 0)
  }

  // Schedule Management
  const addSchedule = (scheduleData) => {
    const newSchedule = {
      ...scheduleData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    }
    setSchedules(prev => [...prev, newSchedule])
    return newSchedule
  }

  const updateSchedule = (id, updates) => {
    setSchedules(prev => 
      prev.map(sched => sched.id === id ? { ...sched, ...updates } : sched)
    )
  }

  const deleteSchedule = (id) => {
    setSchedules(prev => prev.filter(sched => sched.id !== id))
  }

  const getWeekSchedules = (weekStartDate) => {
    const weekEnd = new Date(weekStartDate)
    weekEnd.setDate(weekEnd.getDate() + 7)
    
    return schedules.filter(sched => 
      sched.date >= weekStartDate && sched.date < weekEnd.toISOString().split('T')[0]
    )
  }

  // Availability Management
  const submitAvailability = (employeeId, weekStartDate, availabilityData) => {
    // Remove existing availability for this week
    setAvailabilities(prev => 
      prev.filter(av => !(av.employeeId === employeeId && av.weekStartDate === weekStartDate))
    )
    
    const newAvailability = {
      id: uuidv4(),
      employeeId,
      weekStartDate,
      ...availabilityData,
      submittedAt: new Date().toISOString()
    }
    setAvailabilities(prev => [...prev, newAvailability])
    return newAvailability
  }

  const getEmployeeAvailability = (employeeId, weekStartDate) => {
    return availabilities.find(av => 
      av.employeeId === employeeId && av.weekStartDate === weekStartDate
    )
  }

  const getAllAvailabilitiesForWeek = (weekStartDate) => {
    return availabilities.filter(av => av.weekStartDate === weekStartDate)
  }

  // Statistics
  const getPositionById = (id) => {
    return positions.find(p => p.id === id)
  }

  const getEmployeesByPosition = (positionId) => {
    return employees.filter(emp => emp.position === positionId && emp.isActive)
  }

  const getTodayStats = () => {
    const today = new Date().toISOString().split('T')[0]
    const todaySheets = timesheets.filter(ts => ts.date === today)
    
    return {
      totalEmployees: employees.filter(e => e.isActive).length,
      clockedIn: todaySheets.filter(ts => ts.status === 'clocked-in').length,
      pendingApproval: todaySheets.filter(ts => ts.status === 'pending-approval').length,
      totalHoursToday: todaySheets.reduce((sum, ts) => sum + calculateHoursWorked(ts), 0)
    }
  }

  const value = {
    employees,
    timesheets,
    schedules,
    availabilities,
    positions,
    isLoaded,
    // Employee operations
    addEmployee,
    updateEmployee,
    deleteEmployee,
    getEmployeeById,
    getEmployeesByPosition,
    // Timesheet operations
    clockIn,
    clockOut,
    approveTimesheet,
    getActiveTimesheet,
    getEmployeeTimesheets,
    getTodayTimesheets,
    getPendingApprovals,
    calculateHoursWorked,
    getWeeklyHours,
    // Schedule operations
    addSchedule,
    updateSchedule,
    deleteSchedule,
    getWeekSchedules,
    // Availability operations
    submitAvailability,
    getEmployeeAvailability,
    getAllAvailabilitiesForWeek,
    // Utilities
    getPositionById,
    getTodayStats,
  }

  return (
    <EmployeeContext.Provider value={value}>
      {children}
    </EmployeeContext.Provider>
  )
}

export function useEmployee() {
  const context = useContext(EmployeeContext)
  if (!context) {
    throw new Error('useEmployee must be used within an EmployeeProvider')
  }
  return context
}

