import { useRef, useState } from 'react'
import {
  UploadCloud, Loader2, Download, FileText, CheckCircle2, XCircle, Trash2,
} from 'lucide-react'
import { api } from '../services/api'
import { showError, showSuccess, showWarning } from '../components/Toast'
import {
  formatProbability, getProbabilityColor, getRiskBadgeColor,
} from '../utils/helpers'

const TEMPLATE_COLUMNS = [
  'patient_name', 'age', 'sex', 'cp', 'trestbps', 'chol', 'fbs',
  'restecg', 'thalach', 'exang', 'oldpeak', 'slope', 'ca', 'thal',
]

const SAMPLE_ROWS = [
  [ 'Sample Patient', 55, 1, 0, 130, 250, 0, 0, 150, 0, 1.0, 1, 0, 2 ],
  [ '', 63, 1, 3, 145, 233, 1, 0, 150, 0, 2.3, 0, 0, 1 ],
]

function buildTemplateCsv() {
  const header = TEMPLATE_COLUMNS.join(',')
  const rows = SAMPLE_ROWS.map(r => r.join(',')).join('\n')
  return `${header}\n${rows}`
}

function downloadBlob(content, filename, type = 'text/csv') {
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

export default function BulkPrediction() {
  const fileRef = useRef(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null
    setFile(selected)
    setResult(null)
  }

  const handleUpload = async () => {
    if (!file) {
      showWarning('Please choose a CSV file first')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const response = await api.predictBulk(file)
      setResult(response)
      if (response.error_count > 0) {
        showWarning(`${response.success_count} processed, ${response.error_count} failed validation`)
      } else {
        showSuccess(`Bulk assessment complete: ${response.success_count} patients`)
      }
    } catch (err) {
      showError(err.message || 'Bulk prediction failed. Is the backend running?')
    } finally {
      setLoading(false)
    }
  }

  const handleDownloadTemplate = () => {
    downloadBlob(buildTemplateCsv(), 'heart_assessment_template.csv')
  }

  const handleDownloadResults = () => {
    if (!result) return
    const header = ['id', 'patient_name', 'risk_level', 'probability', 'model_used'].join(',')
    const rows = result.results.map(r => [r.id, `"${r.patient_name}"`, r.risk_level, r.probability, r.model_used].join(','))
    downloadBlob(`${header}\n${rows.join('\n')}`, 'bulk_results.csv')
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Bulk Prediction</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Upload a CSV of multiple patients to assess them all at once
        </p>
      </div>

      <div className="card">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Upload Dataset
          </h3>
          <button type="button" onClick={handleDownloadTemplate} className="btn-secondary text-sm flex items-center gap-2">
            <Download className="w-4 h-4" />
            Download CSV Template
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 mb-4">
          Required columns: {TEMPLATE_COLUMNS.filter(c => c !== 'patient_name').join(', ')}.
          Optional: <code className="px-1 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs">patient_name</code>.
        </p>

        <div
          className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-400 dark:hover:border-primary-500 transition-colors"
          onClick={() => fileRef.current?.click()}
        >
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={handleFileChange}
          />
          <UploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          {file ? (
            <>
              <p className="font-medium text-gray-900 dark:text-white flex items-center justify-center gap-2">
                <FileText className="w-4 h-4" />
                {file.name}
              </p>
              <button
                type="button"
                className="text-xs text-danger-500 mt-2 flex items-center gap-1 mx-auto"
                onClick={(e) => { e.stopPropagation(); setFile(null); if (fileRef.current) fileRef.current.value = ''; setResult(null) }}
              >
                <Trash2 className="w-3 h-3" />
                Remove file
              </button>
            </>
          ) : (
            <>
              <p className="font-medium text-gray-900 dark:text-white">Click to choose a CSV file</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Each row is one patient. Invalid rows are reported without stopping the batch.
              </p>
            </>
          )}
        </div>

        <div className="mt-4">
          <button onClick={handleUpload} disabled={loading || !file} className="btn-primary flex items-center gap-2 disabled:opacity-50">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Analyzing {file ? file.name : ''}...
              </>
            ) : (
              <>
                <UploadCloud className="w-4 h-4" />
                Run Bulk Assessment
              </>
            )}
          </button>
        </div>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="card text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Total Rows</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-danger-500">{result.high_risk_count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">High Risk</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-warning-500">{result.moderate_risk_count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Moderate Risk</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-success-500">{result.low_risk_count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Low Risk</p>
            </div>
            <div className="card text-center">
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{result.error_count}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Skipped</p>
            </div>
          </div>

          {result.results.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Results ({result.results.length})
                </h3>
                <button type="button" onClick={handleDownloadResults} className="btn-secondary text-sm flex items-center gap-2">
                  <Download className="w-4 h-4" />
                  Download Results CSV
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Patient</th>
                      <th className="pb-3 font-medium">Risk Level</th>
                      <th className="pb-3 font-medium">Probability</th>
                      <th className="pb-3 font-medium">Model</th>
                      <th className="pb-3 font-medium">Record ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.results.map((r, i) => (
                      <tr key={r.id ?? i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <td className="py-3 text-gray-400">{i + 1}</td>
                        <td className="py-3 font-medium text-gray-900 dark:text-white">{r.patient_name}</td>
                        <td className="py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRiskBadgeColor(r.risk_level)}`}>
                            {r.risk_level}
                          </span>
                        </td>
                        <td className="py-3" style={{ color: getProbabilityColor(r.probability) }}>
                          {formatProbability(r.probability)}
                        </td>
                        <td className="py-3 text-gray-500 text-xs">{r.model_used}</td>
                        <td className="py-3 text-gray-500 text-xs">{r.id ?? '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.errors.length > 0 && (
            <div className="card border-2 border-danger-200 dark:border-danger-800">
              <h3 className="text-sm font-semibold text-danger-600 dark:text-danger-400 flex items-center gap-2 mb-3">
                <XCircle className="w-4 h-4" />
                Invalid Rows ({result.errors.length})
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 font-medium">CSV Line</th>
                      <th className="pb-3 font-medium">Error</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.errors.map((e, i) => (
                      <tr key={i} className="border-b border-gray-100 dark:border-gray-800 last:border-0">
                        <td className="py-3 text-gray-500">{e.row}</td>
                        <td className="py-3 text-sm text-danger-600 dark:text-danger-400">{e.error}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {!result && (
        <div className="p-4 bg-success-50 dark:bg-success-900/10 border border-success-200 dark:border-success-800 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-success-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-success-700 dark:text-success-400">
            Rows with invalid values are skipped and listed below, so one bad row never blocks the whole batch.
          </p>
        </div>
      )}
    </div>
  )
}