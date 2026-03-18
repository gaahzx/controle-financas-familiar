'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { formatCurrency } from '@/lib/constants'
import type { CategorySummary } from '@/types/database'

interface CategoryChartProps {
  data: CategorySummary[]
}

export default function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) {
    return (
      <div className="bg-bg-card border border-border rounded-2xl p-6">
        <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>
        <div className="flex items-center justify-center h-48 text-text-muted">
          Nenhum gasto registrado ainda
        </div>
      </div>
    )
  }

  return (
    <div className="bg-bg-card border border-border rounded-2xl p-6">
      <h3 className="text-lg font-semibold mb-4">Gastos por Categoria</h3>

      <div className="flex flex-col md:flex-row items-center gap-6">
        {/* Chart */}
        <div className="w-48 h-48">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="total"
                nameKey="category_name"
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                strokeWidth={0}
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.category_color} />
                ))}
              </Pie>
              <Tooltip
                formatter={(value) => formatCurrency(Number(value))}
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#f8fafc',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex-1 space-y-2 w-full">
          {data.map((item) => (
            <div key={item.category_id} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.category_color }}
                />
                <span className="text-sm">
                  {item.category_icon} {item.category_name}
                </span>
              </div>
              <div className="text-right">
                <span className="text-sm font-medium">{formatCurrency(item.total)}</span>
                <span className="text-text-muted text-xs ml-2">
                  {item.percentage.toFixed(0)}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
