'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search,
  Edit2,
  Trash2,
  UserCog,
  Phone,
  Mail,
  DollarSign,
  Clock,
  Calendar,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import { useEmployee } from '../context/EmployeeContext'

function EmployeesContent() {
  const { 
    employees, 
    positions,
    addEmployee, 
    updateEmployee, 
    deleteEmployee,
    getPositionById,
    getWeeklyHours,
    getActiveTimesheet,
    isLoaded 
  } = useEmployee()

  const [searchTerm, setSearchTerm] = useState('')
  const [filterPosition, setFilterPosition] = useState('all')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    position: 'kitchen',
    role: 'staff',
    hourlyRate: ''
  })

  const filteredEmployees = employees.filter(emp => {
    const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         emp.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesPosition = filterPosition === 'all' || emp.position === filterPosition
    return matchesSearch && matchesPosition
  })

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      position: 'kitchen',
      role: 'staff',
      hourlyRate: ''
    })
  }

  const handleAddEmployee = (e) => {
    e.preventDefault()
    addEmployee({
      ...formData,
      hourlyRate: parseFloat(formData.hourlyRate) || 0
    })
    resetForm()
    setIsAddModalOpen(false)
  }

  const handleEditEmployee = (e) => {
    e.preventDefault()
    updateEmployee(selectedEmployee.id, {
      ...formData,
      hourlyRate: parseFloat(formData.hourlyRate) || 0
    })
    resetForm()
    setIsEditModalOpen(false)
    setSelectedEmployee(null)
  }

  const handleDeleteEmployee = () => {
    deleteEmployee(selectedEmployee.id)
    setIsDeleteModalOpen(false)
    setSelectedEmployee(null)
  }

  const openEditModal = (employee) => {
    setSelectedEmployee(employee)
    setFormData({
      name: employee.name,
      email: employee.email,
      phone: employee.phone,
      position: employee.position,
      role: employee.role,
      hourlyRate: employee.hourlyRate.toString()
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (employee) => {
    setSelectedEmployee(employee)
    setIsDeleteModalOpen(true)
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const EmployeeForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="e.g., John Smith"
        required
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="john@example.com"
          required
        />
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="(555) 123-4567"
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Select
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleInputChange}
          options={positions.map(p => ({ value: p.id, label: `${p.icon} ${p.name}` }))}
        />
        <Select
          label="Role"
          name="role"
          value={formData.role}
          onChange={handleInputChange}
          options={[
            { value: 'staff', label: 'Staff' },
            { value: 'manager', label: 'Manager' },
            { value: 'admin', label: 'Admin' }
          ]}
        />
      </div>
      
      <Input
        label="Hourly Rate ($)"
        name="hourlyRate"
        type="number"
        step="0.01"
        min="0"
        value={formData.hourlyRate}
        onChange={handleInputChange}
        placeholder="15.00"
        required
      />
      
      <div className="flex gap-3 pt-4">
        <Button type="submit" fullWidth>
          {submitLabel}
        </Button>
      </div>
    </form>
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
            <UserCog className="w-8 h-8 text-brand-500" />
            Employees
          </h1>
          <p className="text-sage-500 mt-1">Manage your team members and positions</p>
        </div>
        <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add Employee
        </Button>
      </motion.div>

      {/* Stats */}
      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-sage-900">{employees.filter(e => e.isActive).length}</p>
            <p className="text-sm text-sage-500">Active Employees</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-green-600">
              {employees.filter(e => getActiveTimesheet(e.id)).length}
            </p>
            <p className="text-sm text-sage-500">Clocked In Now</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-sage-900">{positions.length}</p>
            <p className="text-sm text-sage-500">Positions</p>
          </div>
        </Card>
        <Card>
          <div className="text-center">
            <p className="text-2xl font-bold text-sage-900">
              ${employees.reduce((sum, e) => sum + e.hourlyRate, 0).toFixed(0)}/hr
            </p>
            <p className="text-sm text-sage-500">Total Labor Cost</p>
          </div>
        </Card>
      </motion.div>

      {/* Search & Filter */}
      <motion.div variants={itemVariants}>
        <Card>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                icon={Search}
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select
              value={filterPosition}
              onChange={(e) => setFilterPosition(e.target.value)}
              options={[
                { value: 'all', label: 'All Positions' },
                ...positions.map(p => ({ value: p.id, label: `${p.icon} ${p.name}` }))
              ]}
              className="sm:w-48"
            />
          </div>
        </Card>
      </motion.div>

      {/* Employees Grid */}
      {filteredEmployees.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card>
            <EmptyState
              icon={UserCog}
              title="No employees found"
              description={searchTerm ? "Try adjusting your search" : "Start by adding your first employee"}
              action={
                !searchTerm && (
                  <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
                    Add First Employee
                  </Button>
                )
              }
            />
          </Card>
        </motion.div>
      ) : (
        <motion.div 
          variants={containerVariants}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {filteredEmployees.map((employee) => {
            const position = getPositionById(employee.position)
            const isClocked = getActiveTimesheet(employee.id)
            const weeklyHours = getWeeklyHours(employee.id)
            
            return (
              <motion.div key={employee.id} variants={itemVariants}>
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: `${position?.color}20` }}
                      >
                        {position?.icon || '👤'}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sage-900 flex items-center gap-2">
                          {employee.name}
                          {isClocked && (
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                          )}
                        </h3>
                        <p className="text-sm text-sage-500">{position?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`
                        px-2 py-0.5 rounded-full text-xs font-medium
                        ${employee.role === 'admin' ? 'bg-purple-100 text-purple-700' :
                          employee.role === 'manager' ? 'bg-blue-100 text-blue-700' :
                          'bg-sage-100 text-sage-700'}
                      `}>
                        {employee.role}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center gap-2 text-sm text-sage-600">
                      <Mail className="w-4 h-4 text-sage-400" />
                      <a href={`mailto:${employee.email}`} className="hover:text-brand-500 truncate">
                        {employee.email}
                      </a>
                    </div>
                    {employee.phone && (
                      <div className="flex items-center gap-2 text-sm text-sage-600">
                        <Phone className="w-4 h-4 text-sage-400" />
                        <a href={`tel:${employee.phone}`} className="hover:text-brand-500">
                          {employee.phone}
                        </a>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-sage-600">
                      <DollarSign className="w-4 h-4 text-sage-400" />
                      <span>${employee.hourlyRate.toFixed(2)}/hr</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-sage-600">
                      <Clock className="w-4 h-4 text-sage-400" />
                      <span>{weeklyHours.toFixed(1)} hrs this week</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-sage-100">
                    <div className="flex items-center gap-2">
                      {employee.isActive ? (
                        <span className="flex items-center gap-1 text-xs text-green-600">
                          <CheckCircle className="w-3 h-3" /> Active
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-red-500">
                          <XCircle className="w-3 h-3" /> Inactive
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(employee)}
                        className="p-2 rounded-lg hover:bg-sage-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-sage-600" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(employee)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Add Employee Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Add Employee"
        size="md"
      >
        <EmployeeForm onSubmit={handleAddEmployee} submitLabel="Add Employee" />
      </Modal>

      {/* Edit Employee Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); resetForm(); setSelectedEmployee(null); }}
        title="Edit Employee"
        size="md"
      >
        <EmployeeForm onSubmit={handleEditEmployee} submitLabel="Save Changes" />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedEmployee(null); }}
        title="Delete Employee"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sage-600 mb-6">
            Are you sure you want to delete <strong>{selectedEmployee?.name}</strong>? 
            This will also delete their timesheet history.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={() => { setIsDeleteModalOpen(false); setSelectedEmployee(null); }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              fullWidth 
              onClick={handleDeleteEmployee}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

export default function EmployeesPage() {
  return (
    <PageWrapper>
      <EmployeesContent />
    </PageWrapper>
  )
}

