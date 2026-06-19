import { LineChart, Line, ResponsiveContainer } from 'recharts';

export default function Sparkline({ data, dataKey, color = "var(--accent-primary)", width = "100%", height = 40 }) {
  return (
    <div style={{ width, height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2} 
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
