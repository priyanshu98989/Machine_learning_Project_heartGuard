import { useEffect, useState, lazy, Suspense } from 'react'
import { Link } from 'react-router-dom'
import { Activity, Users, AlertTriangle, TrendingUp, ClipboardCheck } from 'lucide-react'
import { api } from '../services/api'
import { showError } from '../components/Toast'
import { formatDate, getRiskBadgeColor } from '../utils/helpers'

const RiskDistributionChart = lazy(() => import('../charts/RiskDistributionChart'))
const AgeDistributionChart = lazy(() => import('../charts/AgeDistributionChart'))
const ProbabilityTrendChart = lazy(() => import('../charts/ProbabilityTrendChart'))

const ChartLoader = () => (
  <div className="h-72 bg-gray-200 dark:bg-gray-700/60 rounded-xl animate-pulse" />
)

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.getDashboard()
      .then(setStats)
      .catch(() => showError('Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => (
            <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {[1,2,3].map(i => (
            <div key={i} className="h-72 bg-gray-200 dark:bg-gray-700 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const statCards = [
    {
      label: 'Total Predictions',
      value: stats?.total_predictions || 0,
      icon: Activity,
      color: 'text-primary-500',
      bg: 'bg-primary-50 dark:bg-primary-900/20',
    },
    {
      label: 'High Risk Cases',
      value: stats?.high_risk_count || 0,
      icon: AlertTriangle,
      color: 'text-danger-500',
      bg: 'bg-danger-50 dark:bg-danger-900/20',
    },
    {
      label: 'Average Probability',
      value: stats ? `${(stats.average_probability * 100).toFixed(1)}%` : '0%',
      icon: TrendingUp,
      color: 'text-warning-500',
      bg: 'bg-warning-50 dark:bg-warning-900/20',
    },
    {
      label: 'Moderate Risk',
      value: stats?.moderate_risk_count || 0,
      icon: Users,
      color: 'text-success-500',
      bg: 'bg-success-50 dark:bg-success-900/20',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Overview of prediction analytics
          </p>
        </div>
        <Link to="/predict" className="btn-primary flex items-center gap-2">
          <ClipboardCheck className="w-4 h-4" />
          New Assessment
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="card flex items-center gap-4">
            <div className={`p-3 rounded-xl ${bg}`}>
              <Icon className={`w-6 h-6 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Suspense fallback={<ChartLoader />}>
          <RiskDistributionChart data={stats?.risk_distribution} />
        </Suspense>
        <Suspense fallback={<ChartLoader />}>
          <AgeDistributionChart data={stats?.age_distribution} />
        </Suspense>
        <Suspense fallback={<ChartLoader />}>
          <ProbabilityTrendChart data={stats?.probability_trends} />
        </Suspense>
      </div>

      {stats?.recent_predictions?.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Recent Predictions
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium">Patient</th>
                  <th className="pb-3 font-medium">Age</th>
                  <th className="pb-3 font-medium">Risk Level</th>
                  <th className="pb-3 font-medium">Probability</th>
                  <th className="pb-3 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent_predictions.map((p) => (
                  <tr key={p.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{p.patient_name}</td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{p.age}</td>
                    <td className="py-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRiskBadgeColor(p.risk_level)}`}>
                        {p.risk_level}
                      </span>
                    </td>
                    <td className="py-3 text-gray-600 dark:text-gray-400">{(p.probability * 100).toFixed(1)}%</td>
                    <td className="py-3 text-gray-500 dark:text-gray-500">{formatDate(p.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
