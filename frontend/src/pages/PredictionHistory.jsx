import { useEffect, useState } from 'react'
import { History, Filter, ChevronLeft, ChevronRight, Search, Trash2, FileDown } from 'lucide-react'
import { api } from '../services/api'
import { showError, showSuccess } from '../components/Toast'
import { formatDate, getRiskBadgeColor, formatProbability, getProbabilityColor } from '../utils/helpers'

const RISK_FILTERS = ['', 'High Risk', 'Moderate Risk', 'Low Risk']

export default function PredictionHistory() {
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(0)
  const limit = 10

  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(searchInput)
      setPage(0)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const fetchRecords = () => {
    setLoading(true)
    const params = { limit, offset: page * limit }
    if (filter) params.risk_level = filter
    if (query) params.q = query

    api.getHistory(params)
      .then(setRecords)
      .catch(() => showError('Failed to load prediction history'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchRecords()
  }, [page, filter, query])

  const handleDelete = async (record) => {
    if (!window.confirm(`Delete prediction #${record.id} for "${record.patient_name}"? This cannot be undone.`)) {
      return
    }
    try {
      await api.deleteRecord(record.id)
      showSuccess('Prediction deleted')
      fetchRecords()
    } catch (err) {
      showError(err.message || 'Delete failed')
    }
  }

  const handleDownloadReport = async (record) => {
    try {
      const blob = await api.getReport(record.id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `heartguard_report_${record.id}.pdf`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      showError('Failed to download report')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Prediction History</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            View all past risk assessments
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search by patient..."
              className="input-field pl-9"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filter}
              onChange={(e) => { setFilter(e.target.value); setPage(0) }}
              className="input-field w-auto"
            >
              <option value="">All Risks</option>
              {RISK_FILTERS.filter(Boolean).map(r => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3,4,5].map(i => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-12">
            <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500 dark:text-gray-400">
              {query || filter ? 'No predictions match your filters' : 'No predictions found'}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Run a risk assessment to see results here
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-3 font-medium">#</th>
                    <th className="pb-3 font-medium">Patient</th>
                    <th className="pb-3 font-medium">Age</th>
                    <th className="pb-3 font-medium">Sex</th>
                    <th className="pb-3 font-medium">BP</th>
                    <th className="pb-3 font-medium">Chol</th>
                    <th className="pb-3 font-medium">Risk</th>
                    <th className="pb-3 font-medium">Probability</th>
                    <th className="pb-3 font-medium">Model</th>
                    <th className="pb-3 font-medium">Date</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map((r) => (
                    <tr key={r.id} className="border-b border-gray-100 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      <td className="py-3 text-gray-400">{r.id}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{r.patient_name}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{r.age}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{r.sex === 1 ? 'M' : 'F'}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{r.trestbps}</td>
                      <td className="py-3 text-gray-600 dark:text-gray-400">{r.chol}</td>
                      <td className="py-3">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium text-white ${getRiskBadgeColor(r.risk_level)}`}>
                          {r.risk_level}
                        </span>
                      </td>
                      <td className="py-3" style={{ color: getProbabilityColor(r.probability) }}>
                        {formatProbability(r.probability)}
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-500 text-xs">{r.model_used}</td>
                      <td className="py-3 text-gray-500 dark:text-gray-500 text-xs">{formatDate(r.created_at)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => handleDownloadReport(r)}
                            title="Download PDF report"
                            className="p-2 rounded-lg text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                          >
                            <FileDown className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(r)}
                            title="Delete prediction"
                            className="p-2 rounded-lg text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-900/20 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4" />
                Prev
              </button>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Page {page + 1}
              </span>
              <button
                onClick={() => setPage(p => p + 1)}
                disabled={records.length < limit}
                className="btn-secondary text-sm flex items-center gap-1 disabled:opacity-40"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}