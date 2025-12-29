'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Plus, 
  Search, 
  Filter,
  Edit2,
  Trash2,
  Package,
  ChevronDown,
  AlertTriangle,
  Clock,
  Minus
} from 'lucide-react'
import PageWrapper from '../components/PageWrapper'
import Card from '../components/ui/Card'
import Button from '../components/ui/Button'
import Modal from '../components/ui/Modal'
import Input from '../components/ui/Input'
import Select from '../components/ui/Select'
import EmptyState from '../components/ui/EmptyState'
import { useInventory } from '../context/InventoryContext'
import { format, differenceInDays } from 'date-fns'

function InventoryContent() {
  const { 
    inventory, 
    categories, 
    suppliers,
    addItem, 
    updateItem, 
    deleteItem,
    adjustQuantity,
    isLoaded 
  } = useInventory()

  const [searchTerm, setSearchTerm] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedItem, setSelectedItem] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    quantity: '',
    unit: 'pcs',
    minStock: '',
    costPerUnit: '',
    expirationDate: '',
    supplier: ''
  })

  const unitOptions = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'lbs', label: 'Pounds (lbs)' },
    { value: 'kg', label: 'Kilograms (kg)' },
    { value: 'oz', label: 'Ounces (oz)' },
    { value: 'gal', label: 'Gallons' },
    { value: 'l', label: 'Liters' },
    { value: 'cases', label: 'Cases' },
    { value: 'bags', label: 'Bags' },
    { value: 'heads', label: 'Heads' },
    { value: 'bottles', label: 'Bottles' },
    { value: 'cans', label: 'Cans' },
  ]

  // Filter inventory
  const filteredInventory = useMemo(() => {
    return inventory.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = !categoryFilter || item.category === categoryFilter
      return matchesSearch && matchesCategory
    })
  }, [inventory, searchTerm, categoryFilter])

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const resetForm = () => {
    setFormData({
      name: '',
      category: '',
      quantity: '',
      unit: 'pcs',
      minStock: '',
      costPerUnit: '',
      expirationDate: '',
      supplier: ''
    })
  }

  const handleAddItem = (e) => {
    e.preventDefault()
    addItem({
      ...formData,
      quantity: parseFloat(formData.quantity) || 0,
      minStock: parseFloat(formData.minStock) || 0,
      costPerUnit: parseFloat(formData.costPerUnit) || 0,
    })
    resetForm()
    setIsAddModalOpen(false)
  }

  const handleEditItem = (e) => {
    e.preventDefault()
    updateItem(selectedItem.id, {
      ...formData,
      quantity: parseFloat(formData.quantity) || 0,
      minStock: parseFloat(formData.minStock) || 0,
      costPerUnit: parseFloat(formData.costPerUnit) || 0,
    })
    resetForm()
    setIsEditModalOpen(false)
    setSelectedItem(null)
  }

  const handleDeleteItem = () => {
    deleteItem(selectedItem.id)
    setIsDeleteModalOpen(false)
    setSelectedItem(null)
  }

  const openEditModal = (item) => {
    setSelectedItem(item)
    setFormData({
      name: item.name,
      category: item.category,
      quantity: item.quantity.toString(),
      unit: item.unit,
      minStock: item.minStock.toString(),
      costPerUnit: item.costPerUnit.toString(),
      expirationDate: item.expirationDate || '',
      supplier: item.supplier || ''
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (item) => {
    setSelectedItem(item)
    setIsDeleteModalOpen(true)
  }

  const getItemStatus = (item) => {
    const isLowStock = item.quantity <= item.minStock
    let isExpiringSoon = false
    let daysUntilExpiry = null
    
    if (item.expirationDate) {
      daysUntilExpiry = differenceInDays(new Date(item.expirationDate), new Date())
      isExpiringSoon = daysUntilExpiry >= 0 && daysUntilExpiry <= 7
    }
    
    return { isLowStock, isExpiringSoon, daysUntilExpiry }
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  const ItemForm = ({ onSubmit, submitLabel }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <Input
        label="Item Name"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        placeholder="e.g., Ground Beef"
        required
      />
      
      <div className="grid grid-cols-2 gap-4">
        <Select
          label="Category"
          name="category"
          value={formData.category}
          onChange={handleInputChange}
          options={categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
          placeholder="Select category"
          required
        />
        <Select
          label="Supplier"
          name="supplier"
          value={formData.supplier}
          onChange={handleInputChange}
          options={suppliers.map(s => ({ value: s.id, label: s.name }))}
          placeholder="Select supplier"
        />
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <Input
          label="Quantity"
          name="quantity"
          type="number"
          step="0.01"
          min="0"
          value={formData.quantity}
          onChange={handleInputChange}
          placeholder="0"
          required
        />
        <Select
          label="Unit"
          name="unit"
          value={formData.unit}
          onChange={handleInputChange}
          options={unitOptions}
          required
        />
        <Input
          label="Min Stock"
          name="minStock"
          type="number"
          step="0.01"
          min="0"
          value={formData.minStock}
          onChange={handleInputChange}
          placeholder="0"
          required
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Cost per Unit ($)"
          name="costPerUnit"
          type="number"
          step="0.01"
          min="0"
          value={formData.costPerUnit}
          onChange={handleInputChange}
          placeholder="0.00"
          required
        />
        <Input
          label="Expiration Date"
          name="expirationDate"
          type="date"
          value={formData.expirationDate}
          onChange={handleInputChange}
        />
      </div>
      
      <div className="flex gap-3 pt-4">
        <Button type="submit" fullWidth>
          {submitLabel}
        </Button>
      </div>
    </form>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-sage-900">Inventory</h1>
          <p className="text-sage-500 mt-1">Manage your stock items</p>
        </div>
        <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
          Add Item
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              icon={Search}
              placeholder="Search items..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="sm:w-48">
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              options={categories.map(c => ({ value: c.id, label: `${c.icon} ${c.name}` }))}
              placeholder="All Categories"
            />
          </div>
        </div>
      </Card>

      {/* Inventory Table/Cards */}
      {filteredInventory.length === 0 ? (
        <Card>
          <EmptyState
            icon={Package}
            title="No items found"
            description={searchTerm || categoryFilter 
              ? "Try adjusting your search or filters" 
              : "Start by adding your first inventory item"
            }
            action={
              !searchTerm && !categoryFilter && (
                <Button icon={Plus} onClick={() => setIsAddModalOpen(true)}>
                  Add First Item
                </Button>
              )
            }
          />
        </Card>
      ) : (
        <>
          {/* Desktop Table */}
          <Card padding="none" className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-sage-50 border-b border-sage-100">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-sage-600">Item</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-sage-600">Category</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-sage-600">Quantity</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-sage-600">Cost</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-sage-600">Expiration</th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-sage-600">Status</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-sage-600">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sage-100">
                  {filteredInventory.map((item) => {
                    const category = categories.find(c => c.id === item.category)
                    const status = getItemStatus(item)
                    
                    return (
                      <motion.tr
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className={`
                          hover:bg-sage-50 transition-colors
                          ${status.isLowStock ? 'bg-amber-50/50' : ''}
                          ${status.isExpiringSoon && status.daysUntilExpiry <= 2 ? 'bg-red-50/50' : ''}
                        `}
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">{category?.icon || '📦'}</span>
                            <div>
                              <p className="font-medium text-sage-900">{item.name}</p>
                              <p className="text-sm text-sage-500">
                                ${item.costPerUnit.toFixed(2)}/{item.unit}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="px-3 py-1 rounded-full text-sm font-medium bg-sage-100 text-sage-700">
                            {category?.name || 'Unknown'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => adjustQuantity(item.id, -1)}
                              className="p-1 rounded-lg hover:bg-sage-200 transition-colors"
                            >
                              <Minus className="w-4 h-4 text-sage-600" />
                            </button>
                            <span className="font-semibold text-sage-900 min-w-[60px] text-center">
                              {item.quantity} {item.unit}
                            </span>
                            <button
                              onClick={() => adjustQuantity(item.id, 1)}
                              className="p-1 rounded-lg hover:bg-sage-200 transition-colors"
                            >
                              <Plus className="w-4 h-4 text-sage-600" />
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-medium text-sage-900">
                            ${(item.quantity * item.costPerUnit).toFixed(2)}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          {item.expirationDate ? (
                            <span className={`text-sm ${status.isExpiringSoon ? 'text-orange-600 font-medium' : 'text-sage-600'}`}>
                              {format(new Date(item.expirationDate), 'MMM d, yyyy')}
                            </span>
                          ) : (
                            <span className="text-sage-400 text-sm">N/A</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {status.isLowStock && (
                              <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                                <AlertTriangle className="w-3 h-3" />
                                Low Stock
                              </span>
                            )}
                            {status.isExpiringSoon && (
                              <span className={`
                                flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                                ${status.daysUntilExpiry <= 2 
                                  ? 'bg-red-100 text-red-700' 
                                  : 'bg-orange-100 text-orange-700'
                                }
                              `}>
                                <Clock className="w-3 h-3" />
                                {status.daysUntilExpiry === 0 ? 'Today' : `${status.daysUntilExpiry}d`}
                              </span>
                            )}
                            {!status.isLowStock && !status.isExpiringSoon && (
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                OK
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => openEditModal(item)}
                              className="p-2 rounded-lg hover:bg-sage-100 transition-colors"
                            >
                              <Edit2 className="w-4 h-4 text-sage-600" />
                            </button>
                            <button
                              onClick={() => openDeleteModal(item)}
                              className="p-2 rounded-lg hover:bg-red-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-4">
            {filteredInventory.map((item) => {
              const category = categories.find(c => c.id === item.category)
              const status = getItemStatus(item)
              
              return (
                <Card 
                  key={item.id}
                  className={`
                    ${status.isLowStock ? 'ring-2 ring-amber-300' : ''}
                    ${status.isExpiringSoon && status.daysUntilExpiry <= 2 ? 'ring-2 ring-red-300' : ''}
                  `}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{category?.icon || '📦'}</span>
                      <div>
                        <p className="font-semibold text-sage-900">{item.name}</p>
                        <p className="text-sm text-sage-500">{category?.name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(item)}
                        className="p-2 rounded-lg hover:bg-sage-100"
                      >
                        <Edit2 className="w-4 h-4 text-sage-600" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item)}
                        className="p-2 rounded-lg hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-sage-500 uppercase">Quantity</p>
                      <div className="flex items-center gap-2 mt-1">
                        <button
                          onClick={() => adjustQuantity(item.id, -1)}
                          className="p-1 rounded bg-sage-100"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="font-bold text-sage-900">
                          {item.quantity} {item.unit}
                        </span>
                        <button
                          onClick={() => adjustQuantity(item.id, 1)}
                          className="p-1 rounded bg-sage-100"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-sage-500 uppercase">Total Value</p>
                      <p className="font-bold text-sage-900 mt-1">
                        ${(item.quantity * item.costPerUnit).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {status.isLowStock && (
                      <span className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                        <AlertTriangle className="w-3 h-3" />
                        Low Stock
                      </span>
                    )}
                    {status.isExpiringSoon && (
                      <span className={`
                        flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${status.daysUntilExpiry <= 2 
                          ? 'bg-red-100 text-red-700' 
                          : 'bg-orange-100 text-orange-700'
                        }
                      `}>
                        <Clock className="w-3 h-3" />
                        Expires {status.daysUntilExpiry === 0 ? 'Today' : `in ${status.daysUntilExpiry}d`}
                      </span>
                    )}
                    {item.expirationDate && !status.isExpiringSoon && (
                      <span className="text-xs text-sage-500">
                        Expires {format(new Date(item.expirationDate), 'MMM d')}
                      </span>
                    )}
                  </div>
                </Card>
              )
            })}
          </div>
        </>
      )}

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => { setIsAddModalOpen(false); resetForm(); }}
        title="Add Inventory Item"
        size="lg"
      >
        <ItemForm onSubmit={handleAddItem} submitLabel="Add Item" />
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => { setIsEditModalOpen(false); resetForm(); setSelectedItem(null); }}
        title="Edit Item"
        size="lg"
      >
        <ItemForm onSubmit={handleEditItem} submitLabel="Save Changes" />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => { setIsDeleteModalOpen(false); setSelectedItem(null); }}
        title="Delete Item"
        size="sm"
      >
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
          <p className="text-sage-600 mb-6">
            Are you sure you want to delete <strong>{selectedItem?.name}</strong>? 
            This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={() => { setIsDeleteModalOpen(false); setSelectedItem(null); }}
            >
              Cancel
            </Button>
            <Button 
              variant="danger" 
              fullWidth 
              onClick={handleDeleteItem}
            >
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default function InventoryPage() {
  return (
    <PageWrapper>
      <InventoryContent />
    </PageWrapper>
  )
}

