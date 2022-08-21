import React from 'react';
import Chart from 'react-apexcharts';

function LineChart ({data, title, name}){
    const options = 
    {
        chart: {
          type: 'line',
          height: 350
        },
        title: {
          text: title,
          align: 'left'
        },
        xaxis: {
          type: 'datetime'
        },
        yaxis: {
          tooltip: {
            enabled: true
          }
        }
      };
    
      const series = data.map((candle)=> {return {y:Math.round(candle[1]), x: new Date(candle[0])}});

  	return (
        <Chart options={options} series={[{name: name , data: series}]}  height={350} />
    );
}

export default LineChart;