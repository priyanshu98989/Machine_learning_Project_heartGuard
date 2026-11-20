import { Heart, Menu } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

export default function Header({ onMenuToggle }) {
  return (
    <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between h-16 px-4 lg:px-8">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <div className="p-2 bg-danger-500 rounded-lg">
              <Heart className="w-5 h-5 text-white" fill="white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 dark:text-white leading-tight">
                HeartGuard
              </h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
                Risk Assessment System
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-success-100 dark:bg-success-900/20 text-success-700 dark:text-success-400">
            Educational Use Only
          </span>
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
