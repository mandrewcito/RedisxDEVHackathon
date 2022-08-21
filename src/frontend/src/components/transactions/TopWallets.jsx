import React from "react";
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemIcon from '@mui/material/ListItemIcon';
import { Link } from "react-router-dom";

function TopWallets({wallets, url}) {
    return (<>
        <List sx={{ width: '95%', maxHeight: "60vh", bgcolor: 'background.paper' }}>
        {wallets.map((value, i) => (
          <ListItem
          sx={{padding: "1em"}}
            key={`${value}`}
            disableGutters >
              <ListItemIcon>
                {i + 1}
              </ListItemIcon>
            <Link to={`${url}${value}`}>{value} </Link>                
          </ListItem>
        ))}
      </List>
        </>
    );
}

export default TopWallets;