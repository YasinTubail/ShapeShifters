'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

export interface ChartDataPoint {
  date: string
  revenue: number
  orders: number
}

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean
  payload?: { value: number }[]
  label?: string
}) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 shadow-sm px-3 py-2 text-sm">
      <p className="font-medium text-gray-900 mb-1">{label}</p>
      <p className="text-[#0b6e4f]">₺{payload[0].value.toLocaleString('tr-TR')}</p>
    </div>
  )
}

export function RevenueChart({ data }: { data: ChartDataPoint[] }) {
  const hasData = data.some(d => d.revenue > 0)

  if (!hasData) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-400 text-sm">
        No revenue data for the selected period.
      </div>
    )
  }

  return (
    <div className="h-48">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
            tickLine={false}
            tickFormatter={v => `₺${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
            width={40}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(83,200,122,0.08)' }} />
          <Bar dataKey="revenue" fill="#53c87a" radius={[2, 2, 0, 0]} maxBarSize={32} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
