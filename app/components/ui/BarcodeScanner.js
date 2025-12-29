'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { Scan, X, Keyboard, Camera } from 'lucide-react'
import Button from './Button'
import Input from './Input'

export default function BarcodeScanner({ onScan, onClose }) {
  const [mode, setMode] = useState('select') // 'select', 'camera', 'manual'
  const [manualCode, setManualCode] = useState('')
  const [error, setError] = useState('')
  const [isScanning, setIsScanning] = useState(false)
  const scannerRef = useRef(null)
  const html5QrCodeRef = useRef(null)

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (html5QrCodeRef.current) {
        html5QrCodeRef.current.stop().catch(console.error)
      }
    }
  }, [])

  const startScanner = async () => {
    try {
      setError('')
      setMode('camera')
      setIsScanning(true)

      // Dynamic import for client-side only
      const { Html5Qrcode } = await import('html5-qrcode')
      
      const html5QrCode = new Html5Qrcode('barcode-reader')
      html5QrCodeRef.current = html5QrCode

      await html5QrCode.start(
        { facingMode: 'environment' },
        {
          fps: 10,
          qrbox: { width: 250, height: 150 },
          aspectRatio: 1.777778
        },
        (decodedText) => {
          // Successfully scanned
          html5QrCode.stop().then(() => {
            onScan(decodedText)
            onClose()
          }).catch(console.error)
        },
        (errorMessage) => {
          // Parse error - ignore these as they happen constantly while scanning
        }
      )
    } catch (err) {
      console.error('Error starting scanner:', err)
      setError('Unable to access camera. Please ensure camera permissions are granted or enter the code manually.')
      setMode('select')
      setIsScanning(false)
    }
  }

  const stopScanner = async () => {
    if (html5QrCodeRef.current) {
      try {
        await html5QrCodeRef.current.stop()
      } catch (err) {
        console.error('Error stopping scanner:', err)
      }
    }
    setIsScanning(false)
  }

  const handleManualSubmit = (e) => {
    e.preventDefault()
    if (manualCode.trim()) {
      onScan(manualCode.trim())
      onClose()
    }
  }

  const handleClose = async () => {
    await stopScanner()
    onClose()
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Selection Mode */}
      {mode === 'select' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <p className="text-sm text-sage-600 text-center mb-4">
            Scan a barcode or QR code, or enter it manually
          </p>
          
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={startScanner}
              className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-sage-300 hover:border-brand-500 hover:bg-brand-50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                <Camera className="w-6 h-6 text-brand-600" />
              </div>
              <span className="text-sm font-medium text-sage-700">Scan Code</span>
            </button>

            <button
              onClick={() => setMode('manual')}
              className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-sage-300 hover:border-brand-500 hover:bg-brand-50 transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                <Keyboard className="w-6 h-6 text-sage-600" />
              </div>
              <span className="text-sm font-medium text-sage-700">Enter Manually</span>
            </button>
          </div>
        </motion.div>
      )}

      {/* Camera Scanner Mode */}
      {mode === 'camera' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <div className="relative">
            <div 
              id="barcode-reader" 
              ref={scannerRef}
              className="w-full rounded-xl overflow-hidden"
            />
            
            {isScanning && (
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="w-64 h-32 border-2 border-brand-500 rounded-lg relative">
                  <motion.div
                    className="absolute inset-x-0 h-0.5 bg-brand-500"
                    animate={{ top: ['0%', '100%', '0%'] }}
                    transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                  />
                </div>
              </div>
            )}
          </div>

          <p className="text-sm text-sage-500 text-center">
            Position the barcode within the frame
          </p>

          <div className="flex gap-3">
            <Button 
              variant="secondary" 
              fullWidth 
              onClick={() => { stopScanner(); setMode('select'); }}
            >
              Cancel
            </Button>
            <Button 
              variant="ghost" 
              fullWidth 
              onClick={() => { stopScanner(); setMode('manual'); }}
            >
              Enter Manually
            </Button>
          </div>
        </motion.div>
      )}

      {/* Manual Entry Mode */}
      {mode === 'manual' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-4"
        >
          <form onSubmit={handleManualSubmit}>
            <Input
              label="Barcode / SKU"
              value={manualCode}
              onChange={(e) => setManualCode(e.target.value)}
              placeholder="Enter barcode or product SKU"
              icon={Scan}
              autoFocus
            />
            
            <div className="flex gap-3 mt-4">
              <Button 
                type="button"
                variant="secondary" 
                fullWidth 
                onClick={() => setMode('select')}
              >
                Back
              </Button>
              <Button 
                type="submit"
                fullWidth 
                disabled={!manualCode.trim()}
              >
                Confirm
              </Button>
            </div>
          </form>
        </motion.div>
      )}
    </div>
  )
}

