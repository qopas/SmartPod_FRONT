import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Legend, Dot } from 'recharts';

// Mock data for future predictions
const PREDICTION_DATA = [
  { day: 'Today', moisture: 64, prediction: null },
  { day: 'Apr 29', moisture: null, prediction: 60 },
  { day: 'Apr 30', moisture: null, prediction: 55 },
  { day: 'May 1', moisture: null, prediction: 50 },
  { day: 'May 2', moisture: null, prediction: 45 },
  { day: 'May 3', moisture: null, prediction: 40 },  // Predicted watering day
  { day: 'May 4', moisture: null, prediction: 72 },  // After watering
  { day: 'May 5', moisture: null, prediction: 67 },
];

const WATERING_THRESHOLD = 40;

// Custom tooltip
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    const isWateringDay = payload.some(p => p.name === 'prediction' && p.value <= WATERING_THRESHOLD);
    
    return (
      <div style={{
        backgroundColor: 'white',
        padding: '8px 12px',
        border: '1px solid #ccc',
        borderRadius: '4px'
      }}>
        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '13px' }}>{`${label}`}</p>
        {payload.map((p, index) => {
          if (p.value) {
            return (
              <p key={index} style={{ margin: 0, color: p.color, fontSize: '12px' }}>
                {`${p.name === 'moisture' ? 'Current' : 'Predicted'} Moisture: ${p.value}%`}
              </p>
            );
          }
          return null;
        })}
        {isWateringDay && (
          <p style={{ margin: 0, color: '#FF595E', fontWeight: 'bold', fontSize: '12px' }}>
            Watering recommended
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom dot for prediction line
const CustomizedPredictionDot = (props) => {
  const { cx, cy, value } = props;
  
  if (value <= WATERING_THRESHOLD) {
    return (
      <svg x={cx - 10} y={cy - 10} width={20} height={20} fill="none" viewBox="0 0 20 20">
        <circle cx="10" cy="10" r="10" fill="#FF595E" />
        <path 
          d="M10 4C8 4 6 6 6 10C6 13 8 16 10 16C12 16 14 13 14 10C14 6 12 4 10 4Z" 
          fill="white" 
        />
      </svg>
    );
  }
  
  return <Dot {...props} />;
};

const WateringPredictionChart = () => {
  return (
    <div style={{ width: '100%', height: 300 }}>
      <ResponsiveContainer>
        <LineChart
          data={PREDICTION_DATA}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="day" 
            tick={{ fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 100]} 
            tick={{ fontSize: 12 }}
            ticks={[0, 25, 50, 75, 100]}
            label={{ value: 'Moisture %', angle: -90, position: 'insideLeft', style: { fontSize: 12, textAnchor: 'middle' } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          
          {/* Watering threshold line */}
          <ReferenceLine 
            y={WATERING_THRESHOLD} 
            label={{ 
              value: 'Watering Threshold', 
              position: 'insideBottomRight',
              fontSize: 11,
              fill: '#FF595E'
            }} 
            stroke="#FF595E" 
            strokeDasharray="3 3" 
          />
          
          {/* Historic moisture data */}
          <Line 
            type="monotone" 
            dataKey="moisture" 
            name="Current Moisture" 
            stroke="#3A86FF" 
            strokeWidth={2}
            dot={{ r: 6, fill: "#3A86FF" }}
            activeDot={{ r: 8 }}
          />
          
          {/* Prediction line */}
          <Line 
            type="monotone" 
            dataKey="prediction" 
            name="Predicted Moisture" 
            stroke="#8338EC" 
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={<CustomizedPredictionDot />}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
      
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        padding: '10px',
        backgroundColor: '#f8f9fa',
        borderRadius: '8px',
        margin: '10px 0'
      }}>
        <span style={{ 
          fontSize: '13px', 
          color: '#555',
          textAlign: 'center'
        }}>
          Prediction based on moisture depletion trends from the last 7 days (87% confidence)
        </span>
      </div>
    </div>
  );
};

export default WateringPredictionChart;