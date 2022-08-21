import React from "react";
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {useSelector} from 'react-redux';
import { Link } from "react-router-dom";

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last borde
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

function TransactionList({ sx, transactions }) {
  const usd = useSelector((state=> state.settings.coin === "USD"));

  return (
    <TableContainer sx={sx} component={Paper}>
      <Table aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Timesatmp</StyledTableCell>
            <StyledTableCell>From</StyledTableCell>
            <StyledTableCell>To</StyledTableCell>
            <StyledTableCell align="right">BTC</StyledTableCell>
            <StyledTableCell align="right">{usd? 'USD': 'EUR'}</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {transactions.map((row) => (
            <StyledTableRow key={row.id}>
              <StyledTableCell component="th" scope="row">
                {row.timestamp.substr(11)}
              </StyledTableCell>
              <StyledTableCell>
                <Link to={`/wallets/sender/${row.from}`}>
                  {row.from? row.from.length < 15 ? row.from: row.from.substr(0,15) + "...":"" }
                </Link>
              </StyledTableCell>
              <StyledTableCell>
                <Link to={`/wallets/receiver/${row.to}`}>

                  {row.to ? row.to.length < 15 ? row.to: row.to.substr(0,15) + "...": "" }
                </Link>
              </StyledTableCell>
              <StyledTableCell align="right">{row.from_amount}</StyledTableCell>
              <StyledTableCell align="right">{usd? row.usd: row.eur}</StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>);
}

export default TransactionList;