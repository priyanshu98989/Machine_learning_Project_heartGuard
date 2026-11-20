import { useState } from 'react'
import { ClipboardCheck, Loader2, AlertTriangle, FileDown } from 'lucide-react'
import { api } from '../services/api'
import { showError, showSuccess, showWarning } from '../components/Toast'
import ResultCard from '../components/ResultCard'
import {
  CHEST_PAIN_TYPES, RESTING_ECG, SLOPE_TYPES, THAL_TYPES
} from '../utils/helpers'

const MODEL_OPTIONS = [
  { value: 'best', label: 'Best Model (auto)' },
  { value: 'logistic', label: 'Logistic Regression' },
  { value: 'random_forest', label: 'Random Forest' },
  { value: 'svm', label: 'Support Vector Machine' },
  { value: 'gradient_boost', label: 'Gradient Boosting' },
  { value: 'knn', label: 'K-Nearest Neighbors' },
]

const DEFAULT_VALUES = {
  patient_name: '',
  age: 55,
  sex: 1,
  cp: 0,
  trestbps: 130,
  chol: 250,
  fbs: 0,
  restecg: 0,
  thalach: 150,
  exang: 0,
  oldpeak: 1.0,
  slope: 1,
  ca: 0,
  thal: 2,
  model: 'best',
}

const FORM_FIELDS = [
  { name: 'patient_name', label: 'Patient Name', type: 'text', placeholder: 'Enter name (optional)', colSpan: 2 },
  { name: 'age', label: 'Age', type: 'number', min: 1, max: 120, suffix: 'years' },
  {
    name: 'sex', label: 'Sex', type: 'select',
    options: [{ value: 1, label: 'Male' }, { value: 0, label: 'Female' }],
  },
  {
    name: 'cp', label: 'Chest Pain Type', type: 'select',
    options: Object.entries(CHEST_PAIN_TYPES).map(([v, l]) => ({ value: Number(v), label: `${v} - ${l}` })),
  },
  { name: 'trestbps', label: 'Resting Blood Pressure', type: 'number', min: 50, max: 300, suffix: 'mm Hg' },
  { name: 'chol', label: 'Serum Cholesterol', type: 'number', min: 50, max: 800, suffix: 'mg/dl' },
  {
    name: 'fbs', label: 'Fasting Blood Sugar > 120 mg/dl', type: 'select',
    options: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }],
  },
  {
    name: 'restecg', label: 'Resting ECG Results', type: 'select',
    options: Object.entries(RESTING_ECG).map(([v, l]) => ({ value: Number(v), label: `${v} - ${l}` })),
  },
  { name: 'thalach', label: 'Max Heart Rate', type: 'number', min: 40, max: 250, suffix: 'bpm' },
  {
    name: 'exang', label: 'Exercise Induced Angina', type: 'select',
    options: [{ value: 1, label: 'Yes' }, { value: 0, label: 'No' }],
  },
  { name: 'oldpeak', label: 'ST Depression (Oldpeak)', type: 'number', min: 0, max: 15, step: 0.1 },
  {
    name: 'slope', label: 'Peak Exercise ST Slope', type: 'select',
    options: Object.entries(SLOPE_TYPES).map(([v, l]) => ({ value: Number(v), label: `${v} - ${l}` })),
  },
  { name: 'ca', label: 'Major Vessels (Fluoroscopy)', type: 'number', min: 0, max: 4 },
  {
    name: 'thal', label: 'Thalassemia', type: 'select',
    options: Object.entries(THAL_TYPES).map(([v, l]) => ({ value: Number(v), label: `${v} - ${l}` })),
  },
  { name: 'model', label: 'Model', type: 'select', colSpan: 2, options: MODEL_OPTIONS },
]

export default function RiskAssessment() {
  const [form, setForm] = useState(DEFAULT_VALUES)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value, type } = e.target
    setForm(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setResult(null)

    try {
      const payload = { ...form }
      if (!payload.patient_name) payload.patient_name = 'Anonymous'

      const response = await api.predict(payload)
      setResult(response)
      showSuccess(`Assessment complete: ${response.risk_level}`)
    } catch (err) {
      showError(err.message || 'Prediction failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadReport = async () => {
    if (!result?.id) {
      showWarning('No prediction record available for a report')
      return
    }
    try {
      const blob = await api.getReport(result.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `heartguard_report_${result.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
      showSuccess('PDF report downloaded')
    } catch (err) {
      showError('Failed to download report')
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Risk Assessment</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Enter clinical parameters to assess heart disease risk
        </p>
      </div>

      <div className="p-4 bg-warning-50 dark:bg-warning-900/10 border border-warning-200 dark:border-warning-800 rounded-xl flex items-start gap-3">
        <AlertTriangle className="w-5 h-5 text-warning-500 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-warning-700 dark:text-warning-400">
          This tool is for <strong>educational purposes only</strong>. Predictions are NOT medical diagnoses.
          Always consult a qualified healthcare professional.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="card">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Clinical Parameters
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FORM_FIELDS.map(({ name, label, type, min, max, step, placeholder, suffix, options, colSpan }) => (
              <div key={name} className={colSpan === 2 ? 'sm:col-span-2' : ''}>
                <label className="label">{label}</label>
                {type === 'select' ? (
                  <select
                    name={name}
                    value={form[name]}
                    onChange={handleChange}
                    className="input-field"
                  >
                    {options.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                ) : (
                  <div className="relative">
                    <input
                      type={type}
                      name={name}
                      value={form[name]}
                      onChange={handleChange}
                      min={min}
                      max={max}
                      step={step || 1}
                      placeholder={placeholder}
                      className="input-field pr-16"
                    />
                    {suffix && (
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">
                        {suffix}
                      </span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-3">
            <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-4 h-4" />
                  Run Assessment
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => { setForm(DEFAULT_VALUES); setResult(null) }}
              className="btn-secondary"
            >
              Reset
            </button>
          </div>
        </div>
      </form>

      {result && (
        <div className="mt-6 space-y-4">
          <ResultCard result={result} />
          {result.id && (
            <button
              onClick={handleDownloadReport}
              className="btn-secondary flex items-center gap-2"
            >
              <FileDown className="w-4 h-4" />
              Download PDF Report
            </button>
          )}
        </div>
      )}
    </div>
  )
}
