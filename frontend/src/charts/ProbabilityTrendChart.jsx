import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

export default function ProbabilityTrendChart({ data }) {
  if (!data || data.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Probability Trend
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
          No prediction data yet
        </div>
      </div>
    )
  }

  const chartData = data.map((d, i) => ({
    index: i + 1,
    probability: d.probability,
    date: d.date ? new Date(d.date).toLocaleDateString() : `#${i + 1}`,
  }))

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Probability Trend
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
          <XAxis
            dataKey="index"
            tick={{ fontSize: 12, fill: '#9ca3af' }}
          />
          <YAxis
            domain={[0, 1]}
            tick={{ fontSize: 12, fill: '#9ca3af' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #fff)',
              border: '1px solid var(--tooltip-border, #e5e7eb)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
            formatter={(value) => [`${(value * 100).toFixed(1)}%`, 'Probability']}
          />
          <Line
            type="monotone"
            dataKey="probability"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
