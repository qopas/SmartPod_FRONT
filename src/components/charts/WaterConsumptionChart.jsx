import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// Mock data for water consumption
const WATER_CONSUMPTION_DATA = {
  '24h': [
    { time: '00:00', amount: 0 },
    { time: '04:00', amount: 0 },
    { time: '08:00', amount: 0 },
    { time: '12:00', amount: 0 },
    { time: '14:00', amount: 120 },
    { time: '18:00', amount: 0 },
    { time: '22:00', amount: 0 },
  ],
  '7d': [
    { time: 'Mon', amount: 120 },
    { time: 'Tue', amount: 0 },
    { time: 'Wed', amount: 145 },
    { time: 'Thu', amount: 0 },
    { time: 'Fri', amount: 0 },
    { time: 'Sat', amount: 105 },
    { time: 'Sun', amount: 0 },
  ],
  '30d': [
    { time: 'Week 1', amount: 370 },
    { time: 'Week 2', amount: 425 },
    { time: 'Week 3', amount: 360 },
    { time: 'Week 4', amount: 390 },
  ],
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
        <p style={{ margin: 0, color: '#00B4D8', fontSize: '12px' }}>
          {`Water used: ${payload[0].value > 0 ? payload[0].value + ' ml' : 'None'}`}
        </p>
      </div>
    );
  }
  return null;
};

const WaterConsumptionChart = ({ timeRange = '7d' }) => {
  const data = WATER_CONSUMPTION_DATA[timeRange];
  
  const getYAxisDomain = () => {
    if (timeRange === '30d') {
      return [0, 500];
    }
    return [0, 200];
  };
  
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="time" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={getYAxisDomain()} 
            tick={{ fontSize: 12 }}
            label={{ value: 'Water (ml)', angle: -90, position: 'insideLeft', style: { fontSize: 12, textAnchor: 'middle' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Bar 
            dataKey="amount" 
            name="Water Used (ml)" 
            fill="#00B4D8" 
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WaterConsumptionChart;