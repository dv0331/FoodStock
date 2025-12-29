'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Plus, 
  Search,
  Edit2,
  Trash2,
  Truck,
  Phone,
  Mail,
  MapPin,
  StickyNote,
  User
} from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import EmptyState from '../components/ui/EmptyState'
import { useInventory } from '../context/InventoryContext'

function SuppliersContent() {
  const { 
    suppliers, 
    inventory,
    addSupplier, 
    updateSupplier, 
    deleteSupplier,
    isLoaded 
  } = useInventory()

  const [searchTerm, setSearchTerm] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    phone: '',
    email: '',
    address: '',
    notes: ''
  })

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      contact: '',
      phone: '',
      email: '',
      address: '',
      notes: ''
    })
  }

  const handleAddSupplier = (e) => {
    e.preventDefault()
    addSupplier(formData)
    resetForm()
    setIsAddModalOpen(false)
  }

  const handleEditSupplier = (e) => {
    e.preventDefault()
    updateSupplier(selectedSupplier.id, formData)
    resetForm()
    setIsEditModalOpen(false)
    setSelectedSupplier(null)
  }

  const handleDeleteSupplier = () => {
    deleteSupplier(selectedSupplier.id)
    setIsDeleteModalOpen(false)
    setSelectedSupplier(null)
  }

  const openEditModal = (supplier) => {
    setSelectedSupplier(supplier)
    setFormData({
      name: supplier.name,
      contact: supplier.contact,
      phone: supplier.phone,
      email: supplier.email,
      address: supplier.address,
      notes: supplier.notes || ''
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteModalOpen(true)
  }

  const getSupplierItemCount = (supplierId) => {
    return inventory.filter(item => item.supplier === supplierId).length
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const SupplierForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Company Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="e.g., Fresh Meats Co."
        required
      />
      
      <Input
        label="Contact Person"
        name="contact"
        value={formData.contact}
        onChange={handleInputChange}
        placeholder="e.g., John Smith"
        required
      />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          label="Phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleInputChange}
          placeholder="(555) 123-4567"
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleInputChange}
          placeholder="orders@company.com"
          required
        />
      </div>
      
      <Input
        label="Address"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        placeholder="123 Main St, City, State"
      />
      
      <div className="space-y-1.5">
        <label className="block text-sm font-medium text-sage-700">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          placeholder="Delivery schedule, special instructions, etc."
          rows={3}
          className="
            w-full px-4 py-2.5 rounded-xl
            bg-sage-50 border border-sage-200
            text-sage-900 placeholder-sage-400
            focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent
            transition-all duration-200 resize-none
          "
        />
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
          <h1 className="font-display text-3xl font-bold text-sage-900">Suppliers</h1>
          <p className="text-sage-500 mt-1">Manage your vendors and suppliers</p>
        </div>
        <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add Supplier
        </Button>
      </motion.div>

      {/* Search */}
      <motion.div variants={itemVariants}>
        <Card>
          <Input
            icon={Search}
            placeholder="Search suppliers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </Card>
      </motion.div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <motion.div variants={itemVariants}>
          <Card>
            <EmptyState
              icon={Truck}
              title="No suppliers found"
              description={searchTerm 
                ? "Try adjusting your search" 
                : "Start by adding your first supplier"
              }
              action={
                !searchTerm && (
                  <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
                    Add First Supplier
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
          {filteredSuppliers.map((supplier) => {
            const itemCount = getSupplierItemCount(supplier.id)
            
            return (
              <motion.div key={supplier.id} variants={itemVariants}>
                <Card hover className="h-full">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-sage-100 flex items-center justify-center">
                        <Truck className="w-6 h-6 text-sage-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sage-900">{supplier.name}</h3>
                        <p className="text-sm text-sage-500 flex items-center gap-1">
                          <User className="w-3 h-3" />
                          {supplier.contact}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(supplier)}
                        className="p-2 rounded-lg hover:bg-sage-100 transition-colors"
                      >
                        <Edit2 className="w-4 h-4 text-sage-600" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(supplier)}
                        className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-sage-600">
                      <Phone className="w-4 h-4 text-sage-400" />
                      <a href={`tel:${supplier.phone}`} className="hover:text-brand-500">
                        {supplier.phone}
                      </a>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-sage-600">
                      <Mail className="w-4 h-4 text-sage-400" />
                      <a href={`mailto:${supplier.email}`} className="hover:text-brand-500 truncate">
                        {supplier.email}
                      </a>
                    </div>
                    {supplier.address && (
                      <div className="flex items-start gap-2 text-sm text-sage-600">
                        <MapPin className="w-4 h-4 text-sage-400 shrink-0 mt-0.5" />
                        <span>{supplier.address}</span>
                      </div>
                    )}
                    {supplier.notes && (
                      <div className="flex items-start gap-2 text-sm text-sage-500">
                        <StickyNote className="w-4 h-4 text-sage-400 shrink-0 mt-0.5" />
                        <span className="italic">{supplier.notes}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-sage-100">
                    <span className="text-xs text-sage-500">
                      {itemCount} item{itemCount !== 1 ? 's' : ''} from this supplier
                    </span>
                  </div>
                </Card>
              </motion.div>
            )
          })}
        </motion.div>
      )}

      {/* Add Supplier Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Add Supplier"
        size="md"
      >
        <SupplierForm onSubmit={handleAddSupplier} submitLabel="Add Supplier" />
      </Modal>

      {/* Edit Supplier Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); resetForm(); setSelectedSupplier(null); }}
        title="Edit Supplier"
        size="md"
      >
        <SupplierForm onSubmit={handleEditSupplier} submitLabel="Save Changes" />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedSupplier(null); }}
        title="Delete Supplier"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sage-600 mb-6">
            Are you sure you want to delete <strong>{selectedSupplier?.name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={() => { setIsDeleteModalOpen(false); setSelectedSupplier(null); }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              fullWidth 
              onClick={handleDeleteSupplier}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  )
}

export default function SuppliersPage() {
  return (
    <PageWrapper>
      <SuppliersContent />
    </PageWrapper>
  )
}

