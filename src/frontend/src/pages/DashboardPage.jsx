import React, { useState, useEffect } from "react";
import TransactionList from '../components/transactions/TransactionList';
import ApiService from "../services/ApiService";
import WebsocketService from '../services/WebsocketService';
import CurrentPricesDisplay from "../components/stock/CurrentPricesDisplay";
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import {useSelector} from 'react-redux';
import LineChart from "../components/charts/LineChart";
import { Typography } from "@mui/material";
import TopWalletsTabs from "../components/wallets/TopWalletsTabs";


function DashboardPage() {
  const [txs, setTxs] = useState([]);
  const [volume, setVolume] = useState([]);
  const [btc, setBtc] = useState([]);
  const usd = useSelector((state=> state.settings.coin === "USD"));
  const [currentPrices, setCurrentPrices] = useState(undefined);

  const handleOnMessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === 'tx') {
      setTxs([
        msg['data'],
        ...txs]);
    }
    if (msg.type === "current")
    {
      setCurrentPrices(
        msg["data"]
      )
    }
  }

  const queryGraph = () => {
    ApiService.getStocks().then((response) => setCurrentPrices(response.data))
    ApiService.getStreamVolume().then((response) => setVolume(response.data))
  };

  useEffect(() => {
    queryGraph();
    ApiService.getStreamBtc().then((response) => setBtc(response.data))
  }, []);

  useEffect(() => {

    WebsocketService.suscribe(handleOnMessage)

    //clean up function when we close page
    return () => WebsocketService.unsuscribe(handleOnMessage);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txs]);

  return (
    <Box sx={{ marginTop: "1em", flexGrow: 1 }}>

      <Grid container spacing={2}>
        <Grid item xs={12}>
        {
            currentPrices &&
            <CurrentPricesDisplay  usd={usd} prices={currentPrices}></CurrentPricesDisplay>
          }
        </Grid>
        
        <Grid item xs={6}>
          <LineChart data={volume} name="Volume" title="Transactions per minute"></LineChart>
          <LineChart data={btc} name="Btc" title="Btc exchanged per minute"></LineChart>
        </Grid>
        
        <Grid item xs={6}>
          <TopWalletsTabs />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6"> Transaction stream</Typography>
          {
            txs &&
            <TransactionList sx = {{marginTop: "1em"}}  usd={usd} transactions={txs}></TransactionList>
          }
        </Grid>
      </Grid>
    </Box>
  );
}

export default DashboardPage;