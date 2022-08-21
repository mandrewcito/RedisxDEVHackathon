import React, {useEffect} from "react";
import ApiService from "../../services/ApiService";
import { CircularProgress, Grid, TextField} from "@mui/material";
import { useState } from "react";
function WalletInfo({wallet}){
    const [info, setInfo] = useState(undefined);

    useEffect(()=> {
        ApiService.getWallet(wallet).then(response=> setInfo(response.data));
    }, [])


    return (
    <>
       {
            info !== undefined?
            <Grid container spacing={2}>
                <Grid item xs={6} sm={6}>
                    <TextField size="medium" sx={{width:"100%"}} label="Address" defaultValue={info.address} color="secondary" disabled />
                </Grid>
                <Grid item xs={6}>
                    <TextField label="Address first seen" defaultValue={new Date(info.addressfirstseen)} color="secondary"   disabled/>
                </Grid>
                <Grid item xs={4}>
                    <TextField label="Btc received" sx={{textAlign:"right"}} defaultValue={info.received} color="secondary"   disabled/>
                </Grid>
                <Grid item xs={4}>
                <TextField label="Btc sent" sx={{textAlign:"right"}} defaultValue={info.sent} color="secondary"  disabled/>
                </Grid>
                <Grid item xs={4}>
                    <TextField label="Balance (BTC)" sx={{textAlign:"right"}} defaultValue={info.balance} color="secondary"   disabled/>
                </Grid>
            </Grid>:
            <CircularProgress></CircularProgress>
        }
    </>)
}

export default WalletInfo;

