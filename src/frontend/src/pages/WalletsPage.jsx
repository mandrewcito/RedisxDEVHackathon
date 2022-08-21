import React, { useState, useEffect } from "react";
import ApiService from "../services/ApiService";
import WebsocketService from '../services/WebsocketService';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import TopWallets from '../components/transactions/TopWallets';
import { Typography } from "@mui/material";


function TransactionsPage() {
  const [topSenders, setTopSenders] = useState([]);
  const [topReceivers, setTopReceivers] = useState([]);
  //const usd = useSelector((state=> state.settings.coin === "USD"));

  const handleOnMessage = (e) => {
    const msg = JSON.parse(e.data);
    if (msg.type === "topk")
    {
      setTopSenders(msg["data"]["senders"]);
      setTopReceivers(msg["data"]["receivers"]);
    }
  }
  useEffect(() => {

    WebsocketService.suscribe(handleOnMessage)

    ApiService.getTopWalletsSenders().then((response) => {setTopSenders(response.data);})
    ApiService.getTopWalletsReceivers().then((response) => setTopReceivers(response.data))

    //clean up function when we close page
    return () => WebsocketService.unsuscribe(handleOnMessage);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  

  return (
    <Box sx={{ marginTop: "1em", flexGrow: 1, }}>
      <Grid container spacing={2}> 
        <Grid item xs={6}>
        <Typography variant="h5">From</Typography>
        <TopWallets  url={`/wallets/sender/`} sx = {{padding: "2em", maxHeight: "80vh"}}  wallets={topSenders}  ></TopWallets>

        </Grid>
        <Grid item xs={6}>
          <Typography variant="h5">To</Typography>
         <TopWallets url={`/wallets/receiver/`} sx = {{padding: "2em", maxHeight: "80vh"}}  wallets={ topReceivers} ></TopWallets>

        </Grid>
      </Grid>
    </Box>
  );
}

export default TransactionsPage;