import React from 'react';
import Chart from 'react-apexcharts';

function CandleChart ({data}){
    const options = 
    {
        chart: {
          type: 'candlestick',
          height: 350
        },
        title: {
          text: '',
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
    const series = data.map((candle)=> {return {...candle, x: new Date(candle.x)}});
  	return (
        <Chart options={options} series={[{name:"Candle", data: series}]} type="candlestick" height={350} />
    );
}

export default CandleChart;