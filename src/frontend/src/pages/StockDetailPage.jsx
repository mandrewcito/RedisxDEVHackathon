import React, { useState, useEffect } from "react";
import CandleChart from "../components/charts/CandleChart";
import { useSelector } from "react-redux";
import ApiService from "../services/ApiService";

function StockDetailPage() {
    const [series, setSeries] = useState([]);
    const coin = useSelector((state=> state.settings.coin));

    useEffect(() => {
        ApiService.getStockSeries(coin.toLowerCase()).then((reponse)=> setSeries(reponse.data))
    
        //clean up function when we close page
        //return () => WebsocketService.unsuscribe(handleOnMessage);
    
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, []);
  
      
    return ( <CandleChart data={series}></CandleChart> );
}

export default StockDetailPage;