import toast from 'react-hot-toast'
import { CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react'

export function showSuccess(message) {
  toast.success(message, {
    icon: <CheckCircle className="w-5 h-5 text-success-500" />,
    style: {
      borderRadius: '12px',
      background: 'var(--toast-bg)',
      color: 'var(--toast-color)',
    },
  })
}

export function showError(message) {
  toast.error(message, {
    icon: <XCircle className="w-5 h-5 text-danger-500" />,
    style: {
      borderRadius: '12px',
      background: 'var(--toast-bg)',
      color: 'var(--toast-color)',
    },
  })
}

export function showWarning(message) {
  toast(message, {
    icon: <AlertTriangle className="w-5 h-5 text-warning-500" />,
    style: {
      borderRadius: '12px',
      background: 'var(--toast-bg)',
      color: 'var(--toast-color)',
    },
  })
}

export function showInfo(message) {
  toast(message, {
    icon: <Info className="w-5 h-5 text-primary-500" />,
    style: {
      borderRadius: '12px',
      background: 'var(--toast-bg)',
      color: 'var(--toast-color)',
    },
  })
}
