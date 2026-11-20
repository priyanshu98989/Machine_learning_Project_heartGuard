import { lazy, Suspense } from 'react'
import { Toaster } from 'react-hot-toast'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const RiskAssessment = lazy(() => import('./pages/RiskAssessment'))
const PredictionHistory = lazy(() => import('./pages/PredictionHistory'))
const ModelInfo = lazy(() => import('./pages/ModelInfo'))
const BulkPrediction = lazy(() => import('./pages/BulkPrediction'))

const PageLoader = () => (
  <div className="space-y-4 animate-pulse" role="status" aria-label="Loading">
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-48" />
    <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />
  </div>
)

export default function App() {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--toast-bg, #fff)',
              color: 'var(--toast-color, #1f2937)',
            },
          }}
        />
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<Dashboard />} />
              <Route path="predict" element={<RiskAssessment />} />
              <Route path="predict/bulk" element={<BulkPrediction />} />
              <Route path="history" element={<PredictionHistory />} />
              <Route path="model" element={<ModelInfo />} />
            </Route>
          </Routes>
        </Suspense>
      </BrowserRouter>
    </ThemeProvider>
  )
}
