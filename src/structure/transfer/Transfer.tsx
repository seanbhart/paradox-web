import React, { useState } from "react";
import { ethers } from "ethers";
import {
  withStyles,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";

import "./Transfer.css";
import { tokenFactoryAddress, doxAddress, AccountInfo } from "../../App";
import { TokenInfo } from "../tokens/Tokens";
import AccountMenu from "./AccountMenu";
import TokenMenu from "../tokens/TokenMenu";
import DOXERC20 from "../../contracts/DOXERC20.sol/DOXERC20.json";
import DOXERC20Factory from "../../contracts/DOXERC20Factory.sol/DOXERC20Factory.json";
import ParadoxV1 from "../../contracts/ParadoxV1.sol/ParadoxV1.json";

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
      fontSize: 12,
      cursor: "default",
    },
    body: {
      fontSize: 14,
      cursor: "default",
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
  bookTable: {
    minWidth: 300,
    maxWidth: 300,
  },
  accountsTable: {
    minWidth: 300,
    maxWidth: 300,
  },
  accountsAddressCell: {
    fontSize: 10,
    overflow: "hidden",
    maxWidth: 100,
  },
});

/*
INTERFACES
*/
interface TransferProps {
  provider: ethers.providers.Web3Provider | undefined;
  walletAddress: string;
  addTransaction: (timestamp: number, address: string) => void;
  tokens: TokenInfo[];
  accounts: AccountInfo[];
  getBooks: () => void;
  updateData: () => void;
}

/*
DEFAULT FUNCTION
*/
const Transfer: React.FC<TransferProps> = ({
  provider,
  walletAddress,
  addTransaction,
  tokens,
  accounts,
  getBooks,
  updateData,
}) => {
  const classes = useStyles();
  const [accountSelection, setAccountSelection] = useState("");
  const [tokenSelection, setTokenSelection] = useState("");
  const [tokenQuantity, setTokenQuantity] = useState(0);
  const [tokenAvailable, setTokenAvailable] = useState(0);
  const [buttonLabel, setButtonLabel] = useState("Connect Wallet");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [balanceString, setBalanceString] = useState("0");

  if (walletAddress !== "" && buttonLabel === "Connect Wallet") {
    setButtonLabel("Choose Transfer");
    setButtonDisabled(true);
    updateData();
  }

  async function newAccountSelected(address: string) {
    setAccountSelection(address);
    if (tokenSelection !== "" && tokenQuantity > 0) {
      setButtonLabel("Transfer");
      setButtonDisabled(false);
    } else {
      setButtonLabel("Choose Transfer");
      setButtonDisabled(true);
    }
  }

  async function newTokenSelected(symbol: string) {
    setTokenSelection(symbol);
    await getBookBalance(symbol);
    if (accountSelection !== "" && tokenQuantity > 0) {
      setButtonLabel("Transfer");
      setButtonDisabled(false);
    } else {
      setButtonLabel("Choose Transfer");
      setButtonDisabled(true);
    }
  }

  async function newTokenQuantity(quantity: number) {
    setTokenQuantity(quantity);
    if (
      tokenSelection !== "" &&
      accountSelection !== "" &&
      tokenAvailable >= quantity
    ) {
      setButtonLabel("Transfer");
      setButtonDisabled(false);
    } else if (tokenAvailable < quantity) {
      setButtonLabel("Invalid Quantity");
      setButtonDisabled(true);
    } else {
      setButtonLabel("Choose Transfer");
      setButtonDisabled(true);
    }
  }

  async function getBookBalance(symbol: string) {
    if (!provider) {
      return;
    }
    const signer = provider.getSigner();
    if (!signer) {
      return;
    }
    const tokenAddress = await _getToken(symbol);

    // Get the acount balance from the token
    const signerAddress = await signer.getAddress();
    const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);
    const book = await dox.getBook(signerAddress, tokenAddress);
    let res = ethers.utils.formatUnits(book, 18);
    res = (+res).toFixed(4);
    // console.log("book: ", res, 18);
    setBalanceString(res);
    setTokenAvailable(Number(res));

    getBooks();
  }

  async function transfer() {
    await _transfer(tokenSelection, accountSelection, tokenQuantity);
  }

  // The transfer amount set will be in token amounts with decimals
  // convert to to bignumber with the proper 00s to accomodate decimals
  async function _transfer(
    symbol: string,
    accountAddress: string,
    amount: number
  ) {
    if (!provider) {
      return;
    }
    const signer = provider.getSigner();
    if (!signer) {
      return;
    }
    const tokenAddress = await _getToken(symbol);
    const token = new ethers.Contract(tokenAddress, DOXERC20.abi, signer);

    const decimals = await token.decimals();
    const bigAmt = ethers.utils.parseUnits(amount.toString(), decimals);
    try {
      const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);
      const tx = await dox.transfer(tokenAddress, accountAddress, bigAmt);
      addTransaction(Date.now(), tx.hash);
      await tx.wait();
    } catch (error) {
      console.log(error);
      if (!error.data.message) {
        return;
      }
      error.data.message.includes("INVALID_TOKEN_ADDRESS")
        ? alert("That token address is not valid.")
        : error.data.message.includes("INVALID_ACCOUNT_ADDRESS")
        ? alert("That transfer amount is not valid.")
        : error.data.message.includes("INVALID_TRANSFER_AMOUNT")
        ? alert("That transfer amount is not valid.")
        : alert(
            "There was an error completing the transfer. Please try again."
          );
    }

    // Refresh the token balance
    await getBookBalance(symbol);
  }

  async function _getToken(symbol: string) {
    const tokenFactory = await _getTokenFactory();
    if (!tokenFactory) {
      return;
    }
    return await tokenFactory.getToken(symbol);
  }

  async function _getTokenFactory() {
    if (!provider) {
      return;
    }
    const signer = provider.getSigner();
    if (!signer) {
      return;
    }

    return new ethers.Contract(
      tokenFactoryAddress,
      DOXERC20Factory.abi,
      signer
    );
  }

  // PAGE CONTENT
  const tokenTransfer = (
    <Paper id="transfer">
      <div id="transfer-title">Paradox</div>
      <div id="transfer-menu">
        <div className="transfermenu-label-top-left">Destination Address</div>
        <AccountMenu
          label={String(balanceString)}
          accounts={accounts}
          accountSelect={newAccountSelected}
        />
        <div>
          <div className="transfermenu-label-top-left">Token</div>
          <div className="transfermenu-label-top">Available L0 Balance</div>
        </div>
        <TokenMenu
          label={String(balanceString)}
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={newTokenSelected}
          tokenQuantity={newTokenQuantity}
        />
        <div className="transfermenu-label-bottom">L0 Transfer Amount</div>
      </div>
      <Button
        onClick={transfer}
        id="transfer-button"
        variant="contained"
        color="primary"
        disabled={buttonDisabled}
      >
        {buttonLabel}
      </Button>
    </Paper>
  );

  const bookTable = (
    <div className="transfer-table">
      <TableContainer component={Paper}>
        <Table className={classes.bookTable} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Symbol</StyledTableCell>
              <StyledTableCell align="left">Token Name</StyledTableCell>
              <StyledTableCell align="right">Your L0 Balance</StyledTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tokens.map((token) => (
              <StyledTableRow key={token.symbol}>
                <StyledTableCell component="th" scope="row">
                  {token.symbol}
                </StyledTableCell>
                <StyledTableCell align="left">{token.name}</StyledTableCell>
                <StyledTableCell align="right">
                  {Number(
                    ethers.utils.formatUnits(token.userBalance, token.decimals)
                  ).toFixed(4)}
                </StyledTableCell>
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );

  const accountsTable = (
    <div className="transfer-table">
      <TableContainer component={Paper}>
        <Table className={classes.accountsTable} aria-label="simple table">
          <TableHead>
            <TableRow>
              <StyledTableCell>Paradox Member Accounts</StyledTableCell>
              {/* <StyledTableCell align="left">Address</StyledTableCell> */}
              {/* <StyledTableCell align="right">L0 Balance</StyledTableCell> */}
            </TableRow>
          </TableHead>
          <TableBody>
            {accounts.map((account) => (
              <StyledTableRow key={account.address}>
                <StyledTableCell
                  component="th"
                  scope="row"
                  className={classes.accountsAddressCell}
                >
                  {account.address}
                </StyledTableCell>
                {/* <StyledTableCell
                  align="right"
                  className={classes.accountsAddressCell}
                >
                  {account.address}
                </StyledTableCell> */}
                {/* <StyledTableCell align="right">
                {Number(
                  ethers.utils.formatUnits(token.userBalance, token.decimals)
                ).toFixed(4)}
              </StyledTableCell> */}
              </StyledTableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );

  return (
    <div>
      <header className="App-header">
        <Paper id="transfer-note">
          <strong>Please Note: </strong>Transfers only occur between accounts in
          Layer 0. Use the "L0: Deposit" function to move Layer 1 assets to
          Layer 0 before L0 to L0 transfer.
        </Paper>
        {tokenTransfer}
        {bookTable}
        {accountsTable}
      </header>
    </div>
  );
};

export default Transfer;
