import React, { useState, useEffect } from "react";
import CustomTabPanel from "../../components/shared/TabPanel";
import ApiService from "../../services/ApiService";
import WebsocketService from '../../services/WebsocketService';
import Box from '@mui/material/Box';
import TopWallets from '../../components/transactions/TopWallets';
import { Tabs, Tab, Typography } from "@mui/material";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


function TopWalletsTabs() {
  const [topSenders, setTopSenders] = useState([]);
  const [topReceivers, setTopReceivers] = useState([]);
  //const usd = useSelector((state=> state.settings.coin === "USD"));

  const [value, setValue] = React.useState(0);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  }

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
    <Box sx={{ width: '100%' }}>
      <Typography variant="h5">Most repeated wallets on the chain</Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
            <Tab label="From" {...a11yProps(0)} />
            <Tab label="To" {...a11yProps(1)} />
          </Tabs>
      </Box>
      <CustomTabPanel value={value} index={0}>
        <TopWallets  url={`/wallets/sender/`} sx = {{padding: "2em", maxHeight: "80vh"}}  wallets={topSenders}  ></TopWallets>
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>         
        <TopWallets url={`/wallets/receiver/`} sx = {{padding: "2em", maxHeight: "80vh"}}  wallets={ topReceivers} ></TopWallets>
      </CustomTabPanel>
    </Box>
  );
}

export default TopWalletsTabs;