import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

// Mock data for demonstration
const MOISTURE_DATA = {
  '24h': [
    { time: '00:00', value: 65, watering: false },
    { time: '02:00', value: 63, watering: false },
    { time: '04:00', value: 60, watering: false },
    { time: '06:00', value: 56, watering: false },
    { time: '08:00', value: 52, watering: false },
    { time: '10:00', value: 48, watering: false },
    { time: '12:00', value: 45, watering: false },
    { time: '14:00', value: 72, watering: true },
    { time: '16:00', value: 70, watering: false },
    { time: '18:00', value: 68, watering: false },
    { time: '20:00', value: 66, watering: false },
    { time: '22:00', value: 64, watering: false },
  ],
  '7d': [
    { time: 'Mon', value: 68, watering: true },
    { time: 'Tue', value: 60, watering: false },
    { time: 'Wed', value: 70, watering: true },
    { time: 'Thu', value: 66, watering: false },
    { time: 'Fri', value: 55, watering: false },
    { time: 'Sat', value: 75, watering: true },
    { time: 'Sun', value: 63, watering: false },
  ],
  '30d': [
    { time: 'Week 1', value: 65, watering: true },
    { time: 'Week 2', value: 68, watering: true },
    { time: 'Week 3', value: 62, watering: true },
    { time: 'Week 4', value: 70, watering: true },
  ],
};

// Define the optimal moisture range for the plant
const OPTIMAL_RANGE = {
  min: 55,
  max: 75,
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>{`${label}`}</p>
        <p style={{ margin: 0, color: '#3A86FF', fontSize: '12px' }}>
          {`Moisture: ${payload[0].value}%`}
        </p>
        {payload[0].payload.watering && (
          <p style={{ margin: 0, color: '#4CAF50', fontSize: '12px' }}>
            Watering event
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom dot component for data points
const CustomizedDot = (props) => {
  const { cx, cy, payload } = props;
  
  if (payload.watering) {
    return (
      <svg x={cx - 8} y={cy - 8} width={16} height={16} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="8" cy="8" r="8" fill="#3A86FF" />
        <path d="M8 3C6.5 3 5 4.5 5 7.5C5 9.5 6.5 11 8 11C9.5 11 11 9.5 11 7.5C11 4.5 9.5 3 8 3Z" fill="white" />
      </svg>
    );
  }
  
  return (
    <circle cx={cx} cy={cy} r={4} fill="#3A86FF" />
  );
};

const PlantAnalyticsChart = ({ timeRange = '7d' }) => {
  const data = MOISTURE_DATA[timeRange];
  
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 12 }}
            ticks={[0, 25, 50, 75, 100]}
            label={{ value: 'Moisture %', angle: -90, position: 'insideLeft', style: { fontSize: 12, textAnchor: 'middle' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          
          {/* Optimal range area */}
          <ReferenceLine y={OPTIMAL_RANGE.min} stroke="#FFD166" strokeDasharray="3 3" />
          <ReferenceLine y={OPTIMAL_RANGE.max} stroke="#FFD166" strokeDasharray="3 3" />
          
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3A86FF" 
            strokeWidth={2}
            dot={<CustomizedDot />}
            activeDot={{ r: 6, fill: "#3A86FF" }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PlantAnalyticsChart;