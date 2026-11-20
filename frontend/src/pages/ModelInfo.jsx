import { useEffect, useState } from 'react'
import { Info, CheckCircle, XCircle, Loader2, RefreshCw, Trophy } from 'lucide-react'
import { api } from '../services/api'
import { showError, showSuccess, showWarning } from '../components/Toast'

const METRIC_LABELS = [
  { key: 'accuracy', label: 'Accuracy' },
  { key: 'precision', label: 'Precision' },
  { key: 'recall', label: 'Recall' },
  { key: 'f1', label: 'F1-Score' },
  { key: 'roc_auc', label: 'ROC-AUC' },
]

export default function ModelInfo() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [retraining, setRetraining] = useState(false)

  const fetchMetrics = () => {
    setLoading(true)
    api.getModelMetrics()
      .then(setData)
      .catch((err) => showError(err.message || 'Failed to fetch model info'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchMetrics()
  }, [])

  const handleRetrain = async () => {
    if (!window.confirm('Retrain the model on the current dataset? This may take a few seconds and will replace existing model files.')) {
      return
    }
    setRetraining(true)
    try {
      const response = await api.retrainModel()
      showSuccess(response.message || 'Model retrained successfully')
      fetchMetrics()
    } catch (err) {
      showWarning(err.message || 'Retraining failed')
    } finally {
      setRetraining(false)
    }
  }

  const modelEntries = data ? Object.entries(data.metrics || {}) : []
  const best = data?.best_model
  const importance = data?.feature_importance || {}
  const maxImportance = Math.max(...Object.values(importance), 0.0001)

  if (loading && !data) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Model Information</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Live metrics, feature importance, and model management
          </p>
        </div>
        <button
          onClick={handleRetrain}
          disabled={retraining}
          className="btn-primary flex items-center gap-2 disabled:opacity-60"
        >
          {retraining ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Retraining (may take a few seconds)...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" />
              Retrain Model
            </>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="card">
          <div className="flex items-center gap-3 mb-4">
            {data?.loaded ? (
              <div className="p-2 bg-success-50 dark:bg-success-900/20 rounded-lg">
                <CheckCircle className="w-5 h-5 text-success-500" />
              </div>
            ) : (
              <div className="p-2 bg-danger-50 dark:bg-danger-900/20 rounded-lg">
                <XCircle className="w-5 h-5 text-danger-500" />
              </div>
            )}
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Model Status</h3>
              <p className={`text-sm ${data?.loaded ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {data?.loaded ? 'Loaded & Ready' : 'Not Loaded'}
              </p>
            </div>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="p-2 bg-warning-50 dark:bg-warning-900/20 rounded-lg">
            <Trophy className="w-5 h-5 text-warning-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Best Model</h3>
            <p className="text-sm text-warning-600 dark:text-warning-400">{best || 'Unknown'}</p>
          </div>
        </div>

        <div className="card flex items-center gap-3">
          <div className="p-2 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
            <Info className="w-5 h-5 text-primary-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Features</h3>
            <p className="text-sm text-primary-600 dark:text-primary-400">
              {(data?.feature_names || []).length} clinical inputs
            </p>
          </div>
        </div>
      </div>

      {modelEntries.length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Evaluation Metrics
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-3 font-medium">Model</th>
                  {METRIC_LABELS.map(({ label }) => (
                    <th key={label} className="pb-3 font-medium text-right">{label}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {modelEntries.map(([name, m]) => {
                  const isBest = name === best
                  return (
                    <tr
                      key={name}
                      className={`border-b border-gray-100 dark:border-gray-800 last:border-0 ${
                        isBest ? 'bg-success-50 dark:bg-success-900/10' : ''
                      }`}
                    >
                      <td className="py-3 font-medium text-gray-900 dark:text-white">
                        <span className="flex items-center gap-2">
                          {name}
                          {isBest && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-success-500 text-white">
                              <Trophy className="w-3 h-3" />
                              Best
                            </span>
                          )}
                        </span>
                      </td>
                      {METRIC_LABELS.map(({ key, label }) => (
                        <td
                          key={key}
                          className={`py-3 text-right ${
                            key === 'roc_auc'
                              ? 'font-semibold text-primary-600 dark:text-primary-400'
                              : 'text-gray-600 dark:text-gray-400'
                          }`}
                        >
                          {m[key]?.toFixed ? m[key].toFixed(4) : (m[key] ?? '-')}
                        </td>
                      ))}
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            Metrics computed from the 80/20 train/test split of the dataset. ROC-AUC decides the best model.
          </p>
        </div>
      )}

      {Object.keys(importance).length > 0 && (
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Feature Importance
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
            Normalized relative contribution of each input to the best model's predictions.
          </p>
          <div className="space-y-2.5">
            {Object.entries(importance).map(([feature, value]) => (
              <div key={feature} className="flex items-center gap-3">
                <span className="text-xs text-gray-600 dark:text-gray-400 w-32 flex-shrink-0 truncate">
                  {feature}
                </span>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 flex-1">
                  <div
                    className="h-3 rounded-full bg-primary-500"
                    style={{ width: `${(value / maxImportance) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-gray-500 dark:text-gray-400 w-14 text-right">
                  {(value * 100).toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Preprocessing
        </h3>
        <div className="space-y-2">
          {['StandardScaler (numerical)', 'LabelEncoder (categorical)', 'Missing value imputation (median)', 'Stratified 80/20 train-test split'].map(item => (
            <div key={item} className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <CheckCircle className="w-4 h-4 text-success-500" />
              <span className="text-sm text-gray-700 dark:text-gray-300">{item}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="card border-2 border-warning-200 dark:border-warning-800">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-white">Medical Disclaimer</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              This application is built strictly for <strong>educational and demonstration purposes only</strong>.
              The machine learning models are trained on a public research dataset and are NOT validated for clinical use.
              Predictions should NEVER be used as a substitute for professional medical advice, diagnosis, or treatment.
              Always seek the advice of a qualified healthcare provider with any questions regarding a medical condition.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}