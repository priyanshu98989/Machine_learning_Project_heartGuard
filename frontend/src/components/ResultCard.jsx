import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react'
import { getRiskColor, formatProbability, getProbabilityColor } from '../utils/helpers'

export default function ResultCard({ result }) {
  if (!result) return null

  const Icon = result.risk_level === 'High Risk'
    ? ShieldAlert
    : result.risk_level === 'Moderate Risk'
    ? Shield
    : ShieldCheck

  const iconColor = result.risk_level === 'High Risk'
    ? 'text-danger-500'
    : result.risk_level === 'Moderate Risk'
    ? 'text-warning-500'
    : 'text-success-500'

  return (
    <div className={`card border-2 ${getRiskColor(result.risk_level)} space-y-4`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`p-3 rounded-xl bg-gray-100 dark:bg-gray-700`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              {result.risk_level}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Patient: {result.patient_name}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-3xl font-bold" style={{ color: getProbabilityColor(result.probability) }}>
            {formatProbability(result.probability)}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">Probability</p>
        </div>
      </div>

      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
        <div
          className="h-3 rounded-full transition-all duration-500"
          style={{
            width: `${result.probability * 100}%`,
            backgroundColor: getProbabilityColor(result.probability),
          }}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500 dark:text-gray-400">
          Model: <span className="font-medium text-gray-700 dark:text-gray-300">{result.model_used}</span>
        </span>
        {result.id && (
          <span className="text-gray-500 dark:text-gray-400">
            ID: #{result.id}
          </span>
        )}
      </div>

      {result.feature_importance && Object.keys(result.feature_importance).length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Top Contributing Factors</p>
          <div className="space-y-1.5">
            {Object.entries(result.feature_importance).slice(0, 5).map(([feature, importance]) => (
              <div key={feature} className="flex items-center gap-2">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 flex-1">
                  <div
                    className="h-2 rounded-full bg-primary-500"
                    style={{ width: `${importance * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-24 text-right">
                  {feature}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="p-3 bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-800 rounded-lg">
        <p className="text-xs text-warning-700 dark:text-warning-400">
          {result.disclaimer}
        </p>
      </div>
    </div>
  )
}
