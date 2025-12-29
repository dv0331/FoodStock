'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search,
  Edit2,
  Trash2,
  Users,
  UserPlus,
  Shield,
  User,
  Mail,
  Check,
  X,
  Crown
} from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import { useInventory } from '../context/InventoryContext'
import { format } from 'date-fns'

function UsersContent() {
  const { 
    users, 
    currentUser,
    addUser, 
    updateUser, 
    deleteUser,
    switchUser,
    isLoaded 
  } = useInventory()

  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'staff',
    avatar: null
  })

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const roleOptions = [
    { value: 'admin', label: '👑 Admin - Full Access' },
    { value: 'manager', label: '📊 Manager - Manage Inventory' },
    { value: 'staff', label: '👤 Staff - View & Update Stock' },
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError('')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      role: 'staff',
      avatar: null
    })
    setError('')
  }

  const handleAddUser = (e) => {
    e.preventDefault()
    
    // Check if email already exists
    const emailExists = users.some(u => u.email.toLowerCase() === formData.email.toLowerCase())
    if (emailExists) {
      setError('A user with this email already exists')
      return
    }

    addUser(formData)
    resetForm()
    setIsAddModalOpen(false)
  }

  const handleEditUser = (e) => {
    e.preventDefault()
    
    // Check if email already exists (excluding current user)
    const emailExists = users.some(u => 
      u.email.toLowerCase() === formData.email.toLowerCase() && u.id !== selectedUser.id
    )
    if (emailExists) {
      setError('A user with this email already exists')
      return
    }

    updateUser(selectedUser.id, formData)
    resetForm()
    setIsEditModalOpen(false)
    setSelectedUser(null)
  }

  const handleDeleteUser = () => {
    const result = deleteUser(selectedUser.id)
    if (!result.success) {
      setError(result.message)
      return
    }
    setIsDeleteModalOpen(false)
    setSelectedUser(null)
  }

  const handleToggleActive = (user) => {
    updateUser(user.id, { isActive: !user.isActive })
  }

  const openEditModal = (user) => {
    setSelectedUser(user)
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (user) => {
    setSelectedUser(user)
    setError('')
    setIsDeleteModalOpen(true)
  }

  const getRoleBadge = (role) => {
    switch (role) {
      case 'admin':
        return { bg: 'bg-purple-100', text: 'text-purple-700', icon: Crown, label: 'Admin' }
      case 'manager':
        return { bg: 'bg-blue-100', text: 'text-blue-700', icon: Shield, label: 'Manager' }
      default:
        return { bg: 'bg-sage-100', text: 'text-sage-700', icon: User, label: 'Staff' }
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const UserForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
      
      <Input
        label="Full Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="e.g., John Smith"
        required
      />
      
      <Input
        label="Email"
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        placeholder="john@example.com"
        required
      />
      
      <Select
        label="Role"
        name="role"
        value={formData.role}
        onChange={handleInputChange}
        options={roleOptions}
        required
      />

      <div className="pt-2">
        <p className="text-sm text-sage-600 mb-2">Role Permissions:</p>
        <ul className="text-xs text-sage-500 space-y-1">
          <li>• <strong>Admin:</strong> Full access - manage users, inventory, suppliers, and all settings</li>
          <li>• <strong>Manager:</strong> Manage inventory and suppliers, view reports</li>
          <li>• <strong>Staff:</strong> View inventory, update stock levels only</li>
        </ul>
      </div>
      
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
          <h1 className="font-display text-3xl font-bold text-sage-900">Team Members</h1>
          <p className="text-sage-500 mt-1">Manage users who can access this app</p>
        </div>
        {currentUser?.role === 'admin' && (
          <Button icon={UserPlus} onClick={() => setIsAddModalOpen(true)}>
            Add User
          </Button>
        )}
      </motion.div>

      {/* Current User Card */}
      <motion.div variants={itemVariants}>
        <Card className="bg-gradient-to-r from-brand-500 to-brand-600 text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl">
              {currentUser?.avatar || currentUser?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div>
              <p className="text-brand-100 text-sm">Logged in as</p>
              <h3 className="font-semibold text-lg">{currentUser?.name}</h3>
              <p className="text-brand-100 text-sm">{currentUser?.email}</p>
            </div>
            <div className="ml-auto">
              <span className="px-3 py-1 rounded-full bg-white/20 text-sm font-medium capitalize">
                {currentUser?.role}
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <Card>
          <Input
            icon={Search}
            placeholder="Search users..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>
      </motion.div>

      {/* Users Grid */}
      {filteredUsers.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card>
            <EmptyState
              icon={Users}
              title="No users found"
              description={searchTerm 
                ? "Try adjusting your search" 
                : "Start by adding team members"
              }
              action={
                !searchTerm && currentUser?.role === 'admin' && (
                  <Button icon={UserPlus} onClick={() => setIsAddModalOpen(true)}>
                    Add First User
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
          {filteredUsers.map((user) => {
            const roleBadge = getRoleBadge(user.role)
            const RoleIcon = roleBadge.icon
            const isCurrentUser = user.id === currentUser?.id
            
            return (
              <motion.div key={user.id} variants={itemVariants}>
                <Card hover className={`h-full ${!user.isActive ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center text-lg font-semibold
                        ${isCurrentUser 
                          ? 'bg-brand-100 text-brand-700' 
                          : 'bg-sage-100 text-sage-700'
                        }
                      `}>
                        {user.avatar || user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-sage-900 flex items-center gap-2">
                          {user.name}
                          {isCurrentUser && (
                            <span className="text-xs text-brand-500">(You)</span>
                          )}
                        </h3>
                        <p className="text-sm text-sage-500 flex items-center gap-1">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </p>
                      </div>
                    </div>
                    {currentUser?.role === 'admin' && !isCurrentUser && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEditModal(user)}
                          className="p-2 rounded-lg hover:bg-sage-100 transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-sage-600" />
                        </button>
                        <button
                          onClick={() => openDeleteModal(user)}
                          className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${roleBadge.bg} ${roleBadge.text}
                      `}>
                        <RoleIcon className="w-3 h-3" />
                        {roleBadge.label}
                      </span>
                      
                      {currentUser?.role === 'admin' && !isCurrentUser && (
                        <button
                          onClick={() => handleToggleActive(user)}
                          className={`
                            inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                            ${user.isActive 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-red-100 text-red-700'
                            }
                          `}
                        >
                          {user.isActive ? (
                            <>
                              <Check className="w-3 h-3" />
                              Active
                            </>
                          ) : (
                            <>
                              <X className="w-3 h-3" />
                              Inactive
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    <p className="text-xs text-sage-500">
                      Added {format(new Date(user.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Add Team Member"
        size="md"
      >
        <UserForm onSubmit={handleAddUser} submitLabel="Add User" />
      </Modal>

      {/* Edit User Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); resetForm(); setSelectedUser(null); }}
        title="Edit User"
        size="md"
      >
        <UserForm onSubmit={handleEditUser} submitLabel="Save Changes" />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedUser(null); setError(''); }}
        title="Delete User"
        size="sm"
      >
        <div className="text-center">
          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-700 text-sm">
              {error}
            </div>
          )}
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sage-600 mb-6">
            Are you sure you want to remove <strong>{selectedUser?.name}</strong> from the team? 
            They will no longer have access to this app.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={() => { setIsDeleteModalOpen(false); setSelectedUser(null); setError(''); }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              fullWidth 
              onClick={handleDeleteUser}
            >
              Remove User
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

export default function UsersPage() {
  return (
    <PageWrapper>
      <UsersContent />
    </PageWrapper>
  )
}

