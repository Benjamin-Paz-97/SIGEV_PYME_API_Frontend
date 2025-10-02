import React from 'react';
import '../styles/BarChartStyles.css';

interface BarChartProps {
  data: Array<{
    label: string;
    value: number;
    color?: string;
  }>;
  title?: string;
  maxValue?: number;
}

const BarChart: React.FC<BarChartProps> = ({ data, title, maxValue }) => {
  const max = maxValue || Math.max(...data.map(item => item.value));
  
  return (
    <div className="bar-chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <div className="bar-chart">
        {data.map((item, index) => (
          <div key={index} className="bar-item">
            <div className="bar-wrapper">
              <div 
                className="bar"
                style={{
                  height: `${(item.value / max) * 100}%`,
                  backgroundColor: item.color || '#3b82f6'
                }}
              ></div>
            </div>
            <div className="bar-label">{item.label}</div>
            <div className="bar-value">{item.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default BarChart;
