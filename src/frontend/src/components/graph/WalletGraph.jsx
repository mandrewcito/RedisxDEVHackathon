
import React, { useState, useEffect } from "react";
import ApiService from '../../services/ApiService';
import ReactECharts from 'echarts-for-react';  // or var ReactECharts = require('echarts-for-react');
import CircularProgress from '@mui/material/CircularProgress';



function CustomDiagram({ graph, wallet }) {
    const [loading, setLoading] = useState(true);

    const maxValue = Math.max(...graph.nodes.map(o=> Math.abs(o.value)));
    
    const secondMaxValue = Math.max(...graph.nodes.filter(o=> Math.abs(o.value) < maxValue).map(o=> Math.abs(o.value)));

    const initialNodes = graph.nodes.map((o, index) => {
        const isSourceWallet = o.label === wallet;

        return {
            type: isSourceWallet? 'input': 'output',
            id: o.label,
            zIndex: isSourceWallet? 10: 0,
            symbolSize: isSourceWallet? 20:  (Math.abs(o.value)/secondMaxValue) *20,
            name: `${Math.round(o.value *100) / 100} Btc (${o.label})`,
            select: {
                label:  `${o.label} - ${o.value}`
            },
            itemStyle: {
                color: isSourceWallet? "red": "blue",
            }
        }
    })

    const initialEdges = graph.edges.map((o, i) => {
        return { 
            animated: o.amount > 20, 
            key: `${o.id}`, 
            id: `${o.id}`, 
            source: o.from, 
            target: o.to, 
            value: (Math.round(o.amount*1000)/1000), 
            label: (Math.round(o.amount*1000)/1000) + " Btc", 
        } 
    })

const options = {
    title: {
      text: 'Wallet chart'
    },
    height:550,
    animationDurationUpdate: 0,
    animationEasingUpdate: 'quinticInOut',
    series: [
      {
        type: 'graph',
        layout: 'force',
        force: {
            initLayout: 'circular'
        },
        // progressiveThreshold: 700,
        data: initialNodes,
        links: initialEdges,
        emphasis: {
          focus: 'adjacency',
          label: {
            position: 'right',
            show: true
          }
        },
        roam: true,
        lineStyle: {
          width: 0.5,
          curveness: 0.3,
          opacity: 0.7
        },
        label:{
            show:false
        }
      }
    ]
  };

    
    return (
    <>
        {loading&& <CircularProgress></CircularProgress>}
        <ReactECharts
            showLoading={loading}
            option={options}
            notMerge={true}
            lazyUpdate={true}
            onChartReady={()=>setLoading(false)}
            />
    </>


   );
}

function WalletGraph({ wallet, sender }) {
    const [graph, setGraph] = useState(undefined);

    useEffect(() => {
        const fn = sender ? ApiService.getWalletSenderGraph : ApiService.getWalletReceiverGraph
        fn(wallet)
            .then((response) => setGraph(response.data))
            .catch(() => setGraph({ nodes: [], edges: [] }))
    }, [wallet]);

    return (
        graph &&
            <CustomDiagram graph={graph} wallet={wallet}></CustomDiagram>
    );
}

export default WalletGraph; 