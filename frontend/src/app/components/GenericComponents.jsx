import React from 'react'
import { User, Bell, Search, Menu, X, ChevronRight, Check, CheckCircle } from 'lucide-react'

// ==========================================
// Base Utilities — Tailwind UI patterns
// ==========================================
export const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 ${className}`}>
    {children}
  </div>
)

// Tailwind UI: Badges — ring-inset style
export const Badge = ({ children, color = 'indigo', className = '' }) => {
  const colors = {
    indigo: 'bg-indigo-50 text-indigo-700 ring-indigo-600/20',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
    amber: 'bg-amber-50 text-amber-700 ring-amber-600/20',
    rose: 'bg-rose-50 text-rose-700 ring-rose-600/20',
    slate: 'bg-slate-50 text-slate-700 ring-slate-600/20',
    violet: 'bg-violet-50 text-violet-700 ring-violet-600/20',
    sky: 'bg-sky-50 text-sky-700 ring-sky-600/20',
  }
  return (
    <span
      className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${colors[color] || colors.slate} ${className}`}
    >
      {children}
    </span>
  )
}

export const Tag = ({ children, className = '' }) => (
  <span
    className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-slate-100 text-slate-600 ${className}`}
  >
    {children}
  </span>
)

export const AvatarWithStatus = ({ src, alt, status, size = 'md', className = '' }) => {
  const sizes = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }

  const statusColors = {
    online: 'bg-emerald-400',
    offline: 'bg-slate-300',
    away: 'bg-amber-400',
    busy: 'bg-rose-400',
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <img
        src={src || 'https://via.placeholder.com/150'}
        alt={alt || 'Avatar'}
        className={`${sizes[size]} rounded-full object-cover border-2 border-white shadow-sm`}
      />
      {status && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ring-2 ring-white
            ${size === 'sm' ? 'w-2 h-2' : size === 'lg' ? 'w-4 h-4' : 'w-3 h-3'}
            ${statusColors[status] || statusColors.offline}
          `}
        />
      )}
    </div>
  )
}

// ==========================================
// Complex Components
// ==========================================

export const StatCard = ({
  label,
  value,
  trend,
  trendLabel,
  icon: Icon,
  colorClass = 'text-indigo-600 bg-indigo-50 ring-indigo-500/10',
}) => (
  <div className="overflow-hidden rounded-xl bg-white px-4 py-5 shadow-sm ring-1 ring-slate-900/5 sm:p-6 hover:shadow-md transition-shadow flex flex-col relative">
    <div className="flex items-center justify-between">
      <dt className="truncate text-sm font-medium text-slate-500">{label}</dt>
      {Icon && (
        <div className={`flex-shrink-0 rounded-lg p-2 ring-1 ring-inset ${colorClass}`}>
          <Icon size={20} aria-hidden="true" />
        </div>
      )}
    </div>
    <dd className="mt-4 flex items-baseline gap-x-2">
      <span className="text-3xl font-semibold tracking-tight text-slate-900">{value}</span>
      {trend && (
        <span
          className={`text-sm font-medium ${trend.startsWith('+') ? 'text-emerald-600' : 'text-rose-600'}`}
        >
          {trend}
        </span>
      )}
      {trendLabel && <span className="text-sm text-slate-500">{trendLabel}</span>}
    </dd>
  </div>
)

export const Modal = ({ isOpen, onClose, title, description, children, size = 'md' }) => {
  if (!isOpen) return null
  const maxW =
    { sm: 'sm:max-w-sm', md: 'sm:max-w-lg', lg: 'sm:max-w-2xl', xl: 'sm:max-w-4xl' }[size] ||
    'sm:max-w-lg'

  return (
    <div className="relative z-50" aria-labelledby="modal-title" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          {/* Modal Panel */}
          <div
            className={`relative transform overflow-hidden rounded-2xl bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full ${maxW} border border-slate-200`}
          >
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4 border-b border-slate-100">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-semibold leading-6 text-slate-900" id="modal-title">
                    {title}
                  </h3>
                  {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <span className="sr-only">Close</span>
                  <X size={20} aria-hidden="true" />
                </button>
              </div>
            </div>
            <div className="px-4 py-5 sm:p-6 bg-slate-50/50">{children}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export const Table = ({ headers, data, renderRow, emptyMessage = 'No data available' }) => (
  <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
    <table className="min-w-full divide-y divide-slate-300">
      <thead className="bg-slate-50">
        <tr>
          {headers.map((header, index) => (
            <th
              key={index}
              scope="col"
              className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6"
            >
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-200 bg-white">
        {data.map((item, index) => (
          <tr key={index} className="hover:bg-slate-50 transition-colors">
            {renderRow(item)}
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan={headers.length} className="px-3 py-8 text-center text-sm text-slate-500">
              {emptyMessage}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
)

// Tailwind UI: Tabs — pill variant (background highlight)
export const PillTab = ({ tabs, activeTab, onChange }) => (
  <div className="flex space-x-1 bg-slate-100/60 p-1 rounded-xl w-max">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150
                    ${
                      activeTab === tab.id
                        ? 'bg-white text-slate-900 shadow-sm ring-1 ring-slate-900/5'
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
      >
        {tab.label}
      </button>
    ))}
  </div>
)

// Tailwind UI: Notifications / Alert toasts
export const Toast = ({ show, type = 'success', title, message, onClose }) => {
  if (!show) return null
  const icon =
    type === 'success' ? (
      <CheckCircle className="h-6 w-6 text-emerald-400" aria-hidden="true" />
    ) : (
      <X className="h-6 w-6 text-rose-400" aria-hidden="true" />
    )
  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-white shadow-lg ring-1 ring-black/5">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{icon}</div>
          <div className="ml-3 w-0 flex-1 pt-0.5">
            {title && <p className="text-sm font-semibold text-slate-900">{title}</p>}
            {message && <p className="mt-1 text-sm text-slate-500">{message}</p>}
          </div>
          {onClose && (
            <div className="ml-4 flex flex-shrink-0">
              <button
                onClick={onClose}
                className="inline-flex rounded-md bg-white text-slate-400 hover:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                <span className="sr-only">Close</span>
                <X size={16} aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
