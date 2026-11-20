import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardCheck, UploadCloud, History, Info } from 'lucide-react'

const links = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/predict', icon: ClipboardCheck, label: 'Risk Assessment' },
  { to: '/predict/bulk', icon: UploadCloud, label: 'Bulk Prediction' },
  { to: '/history', icon: History, label: 'Prediction History' },
  { to: '/model', icon: Info, label: 'Model Info' },
]

export default function Sidebar({ onNavigate }) {
  return (
    <nav className="space-y-1">
      <p className="px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
        Navigation
      </p>
      {links.map(({ to, icon: Icon, label }) => (
        <NavLink
          key={to}
          to={to}
          onClick={onNavigate}
          className={({ isActive }) =>
            isActive ? 'sidebar-link-active' : 'sidebar-link'
          }
          end={to === '/'}
        >
          <Icon className="w-5 h-5" />
          {label}
        </NavLink>
      ))}

      <div className="pt-6 px-4">
        <div className="p-4 bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-800 rounded-lg">
          <p className="text-xs font-medium text-warning-700 dark:text-warning-400">
            Medical Disclaimer
          </p>
          <p className="text-xs text-warning-600 dark:text-warning-500 mt-1">
            This tool is for educational purposes only and is NOT a substitute for professional medical advice.
          </p>
        </div>
      </div>
    </nav>
  )
}
