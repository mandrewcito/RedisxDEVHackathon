import React from 'react';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip'
import {useSelector} from 'react-redux';

function CurrentPriceDisplay({stockPrice, coin}) {
    return (
        <>
            <Chip variant='outlined' label={`${new Date(stockPrice.time* 1000)}`} />
            &nbsp;
            <Chip variant='outlined' label={`Open: ${stockPrice.open} ${coin}`} />
            
            &nbsp;
            <Chip variant='outlined' label={`Close: ${stockPrice.close} ${coin}`} />
            
            &nbsp;
            <Chip variant='outlined' label={`High: ${stockPrice.high} ${coin}`} />
            
            &nbsp;
            <Chip variant='outlined' label={`Lower: ${stockPrice.low} ${coin}`} />
        </>
    );
}

function CurrentPricesDisplay({prices}) {
    const usd = useSelector(state => state.settings.coin === "USD");

    return (<div style={{display: 'flex', justifyContent: `space-around`}}>
        <Typography variant="h5">
            {
                <CurrentPriceDisplay coin={usd? "$": "€"} stockPrice={usd? prices.USD: prices.EUR}></CurrentPriceDisplay>
            }
        </Typography>
    </div>);
}

export default CurrentPricesDisplay;