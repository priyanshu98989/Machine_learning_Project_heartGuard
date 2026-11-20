import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

const COLORS = ['#ef4444', '#f59e0b', '#22c55e']

export default function RiskDistributionChart({ data }) {
  const chartData = [
    { name: 'High Risk', value: data?.['High Risk'] || 0 },
    { name: 'Moderate Risk', value: data?.['Moderate Risk'] || 0 },
    { name: 'Low Risk', value: data?.['Low Risk'] || 0 },
  ].filter(d => d.value > 0)

  if (chartData.length === 0) {
    return (
      <div className="card">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
          Risk Distribution
        </h3>
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500 text-sm">
          No prediction data yet
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">
        Risk Distribution
      </h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={4}
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--tooltip-bg, #fff)',
              border: '1px solid var(--tooltip-border, #e5e7eb)',
              borderRadius: '8px',
              fontSize: '12px',
            }}
          />
          <Legend
            verticalAlign="bottom"
            height={36}
            formatter={(value) => (
              <span className="text-xs text-gray-600 dark:text-gray-400">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
