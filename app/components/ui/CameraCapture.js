'use client'

import { useState, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Camera, X, RotateCcw, Check, Image as ImageIcon, Upload } from 'lucide-react'
import Button from './Button'

export default function CameraCapture({ onCapture, onClose, currentImage }) {
  const [mode, setMode] = useState('select') // 'select', 'camera', 'preview'
  const [stream, setStream] = useState(null)
  const [capturedImage, setCapturedImage] = useState(currentImage || null)
  const [error, setError] = useState('')
  const [facingMode, setFacingMode] = useState('environment') // 'user' or 'environment'
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const fileInputRef = useRef(null)

  const startCamera = useCallback(async () => {
    try {
      setError('')
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      })
      setStream(mediaStream)
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }
      setMode('camera')
    } catch (err) {
      console.error('Error accessing camera:', err)
      setError('Unable to access camera. Please ensure camera permissions are granted.')
    }
  }, [facingMode])

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
  }, [stream])

  const switchCamera = useCallback(async () => {
    stopCamera()
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment')
    setTimeout(() => startCamera(), 100)
  }, [stopCamera, startCamera])

  const capturePhoto = useCallback(() => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current
      const canvas = canvasRef.current
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      const ctx = canvas.getContext('2d')
      ctx.drawImage(video, 0, 0)
      const imageData = canvas.toDataURL('image/jpeg', 0.8)
      setCapturedImage(imageData)
      stopCamera()
      setMode('preview')
    }
  }, [stopCamera])

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size must be less than 5MB')
        return
      }
      const reader = new FileReader()
      reader.onload = (event) => {
        setCapturedImage(event.target.result)
        setMode('preview')
      }
      reader.readAsDataURL(file)
    }
  }

  const retake = () => {
    setCapturedImage(null)
    setMode('select')
  }

  const confirmImage = () => {
    onCapture(capturedImage)
    handleClose()
  }

  const removeImage = () => {
    setCapturedImage(null)
    onCapture(null)
    setMode('select')
  }

  const handleClose = () => {
    stopCamera()
    onClose()
  }

  return (
    <div className="space-y-4">
      <AnimatePresence mode="wait">
        {/* Selection Mode */}
        {mode === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">
                {error}
              </div>
            )}

            {/* Current Image Preview */}
            {capturedImage && (
              <div className="relative">
                <img 
                  src={capturedImage} 
                  alt="Product" 
                  className="w-full h-48 object-cover rounded-xl"
                />
                <button
                  onClick={removeImage}
                  className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={startCamera}
                className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-sage-300 hover:border-brand-500 hover:bg-brand-50 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-brand-100 flex items-center justify-center">
                  <Camera className="w-6 h-6 text-brand-600" />
                </div>
                <span className="text-sm font-medium text-sage-700">Take Photo</span>
              </button>

              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-sage-300 hover:border-brand-500 hover:bg-brand-50 transition-all"
              >
                <div className="w-12 h-12 rounded-full bg-sage-100 flex items-center justify-center">
                  <Upload className="w-6 h-6 text-sage-600" />
                </div>
                <span className="text-sm font-medium text-sage-700">Upload Image</span>
              </button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />

            <p className="text-xs text-sage-500 text-center">
              Supported formats: JPG, PNG, GIF. Max size: 5MB
            </p>
          </motion.div>
        )}

        {/* Camera Mode */}
        {mode === 'camera' && (
          <motion.div
            key="camera"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-video bg-black rounded-xl overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={switchCamera}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>
                <button
                  onClick={capturePhoto}
                  className="p-4 bg-white rounded-full hover:bg-gray-100 ring-4 ring-white/50"
                >
                  <Camera className="w-8 h-8 text-sage-900" />
                </button>
                <button
                  onClick={() => { stopCamera(); setMode('select'); }}
                  className="p-3 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </motion.div>
        )}

        {/* Preview Mode */}
        {mode === 'preview' && capturedImage && (
          <motion.div
            key="preview"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            <div className="relative aspect-video bg-sage-100 rounded-xl overflow-hidden">
              <img
                src={capturedImage}
                alt="Captured"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" fullWidth onClick={retake} icon={RotateCcw}>
                Retake
              </Button>
              <Button fullWidth onClick={confirmImage} icon={Check}>
                Use Photo
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

