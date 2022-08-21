import React from "react";
import { Box } from "@mui/material";
import { useParams } from "react-router-dom";
import WalletGraph from "../components/graph/WalletGraph";
import WalletInfo from "../components/wallets/WalletInfo";
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import CustomTabpanel from "../components/shared/TabPanel";

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}


function WalletDetailPage() {
    const [value, setValue] = React.useState(0);

    const handleChange = (event, newValue) => {
      setValue(newValue);
    }

    let { kind, wallet } = useParams();
    return ( 

        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                  <Tab label="Info" {...a11yProps(0)} />
                  <Tab label="Reports" {...a11yProps(1)} />
                </Tabs>
            </Box>
            <CustomTabpanel value={value} index={0}>
                <WalletInfo wallet={wallet}></WalletInfo>
                <Box sx={{marginTop: "2em"}}>
                    <WalletGraph  wallet={wallet} sender={kind === "sender"}></WalletGraph>
                </Box>
            </CustomTabpanel>
            <CustomTabpanel value={value} index={1}>
                <iframe title="bitcoin abuse" width="100%" height="700px" src={`https://www.bitcoinabuse.com/reports/${wallet}`} />
            </CustomTabpanel>
            </Box>
    );
}

export default WalletDetailPage;