import React, { useEffect } from 'react'
import { X } from 'lucide-react'

export const Drawer = ({ isOpen, onClose, children }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'auto'
    }
    return () => {
      document.body.style.overflow = 'auto'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex md:hidden">
      <div
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity ${isOpen ? 'opacity-100' : 'opacity-0'}`}
        onClick={onClose}
      />
      <div
        className={`relative w-72 max-w-[80vw] bg-white h-full shadow-2xl transition-transform transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}
      >
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}
