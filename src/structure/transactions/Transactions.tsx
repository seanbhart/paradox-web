import React from "react";
import {
  withStyles,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import ReplayIcon from "@material-ui/icons/Replay";
import Moment from "react-moment";

import "./Transactions.css";
import { TransactionInfo, etherscanBaseUrl } from "../../App";

// const nf = Intl.NumberFormat();

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
      fontSize: 12,
      cursor: "default",
    },
    body: {
      fontSize: 10,
      cursor: "default",
      paddingTop: 5,
      paddingBottom: 5,
      paddingLeft: 10,
      paddingRight: 10,
    },
  })
)(TableCell);

const StyledTableRow = withStyles((theme: Theme) =>
  createStyles({
    root: {
      "&:nth-of-type(odd)": {
        backgroundColor: theme.palette.action.hover,
      },
    },
  })
)(TableRow);

const useStyles = makeStyles({
  table: {
    minWidth: 200,
    maxWidth: 200,
  },
});

/*
INTERFACES
*/
interface TransactionsProps {
  transactions: TransactionInfo[];
  clearTransactions: () => void;
}

/*
DEFAULT FUNCTION
*/
const Transactions: React.FC<TransactionsProps> = ({
  transactions,
  clearTransactions,
}) => {
  const classes = useStyles();

  return (
    <div id="tx-container">
      <Paper>
        <div id="tx-title-container">
          <div id="tx-title">Transactions</div>
          <ReplayIcon id="tx-clear" onClick={clearTransactions} />
        </div>
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Time</StyledTableCell>
                <StyledTableCell align="right">Address</StyledTableCell>
                <StyledTableCell align="right"></StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {transactions.map((transaction) => (
                <StyledTableRow key={transaction.address}>
                  <StyledTableCell component="th" scope="row">
                    <Moment format="h:mm A" date={transaction.timestamp} />
                  </StyledTableCell>
                  <StyledTableCell align="right" className="address-cell">
                    {transaction.address}
                  </StyledTableCell>
                  <StyledTableCell align="right">
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={etherscanBaseUrl + transaction.address}
                    >
                      <OpenInNewIcon className="tx-link-icon" />
                    </a>
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </div>
  );
};
export default Transactions;
