export function getRiskColor(riskLevel) {
  switch (riskLevel) {
    case 'High Risk':
      return 'text-danger-500 bg-danger-50 dark:bg-danger-900/20 border-danger-200 dark:border-danger-800'
    case 'Moderate Risk':
      return 'text-warning-600 bg-warning-50 dark:bg-warning-900/20 border-warning-200 dark:border-warning-800'
    case 'Low Risk':
      return 'text-success-600 bg-success-50 dark:bg-success-900/20 border-success-200 dark:border-success-800'
    default:
      return 'text-gray-500 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
  }
}

export function getRiskBadgeColor(riskLevel) {
  switch (riskLevel) {
    case 'High Risk':
      return 'bg-danger-500'
    case 'Moderate Risk':
      return 'bg-warning-500'
    case 'Low Risk':
      return 'bg-success-500'
    default:
      return 'bg-gray-500'
  }
}

export function getProbabilityColor(probability) {
  if (probability >= 0.7) return '#ef4444'
  if (probability >= 0.4) return '#f59e0b'
  return '#22c55e'
}

export function formatProbability(prob) {
  return `${(prob * 100).toFixed(1)}%`
}

export function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const CHEST_PAIN_TYPES = {
  0: 'Typical Angina',
  1: 'Atypical Angina',
  2: 'Non-anginal Pain',
  3: 'Asymptomatic',
}

export const RESTING_ECG = {
  0: 'Normal',
  1: 'ST-T Abnormality',
  2: 'Left Ventricular Hypertrophy',
}

export const SLOPE_TYPES = {
  0: 'Upsloping',
  1: 'Flat',
  2: 'Downsloping',
}

export const THAL_TYPES = {
  0: 'Normal',
  1: 'Fixed Defect',
  2: 'Reversible Defect',
  3: 'Unknown',
}
