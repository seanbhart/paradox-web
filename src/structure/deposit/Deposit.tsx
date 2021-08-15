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

import "./Deposit.css";
import { tokenFactoryAddress, doxAddress } from "../../App";
import { TokenInfo } from "../tokens/Tokens";
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
  table: {
    minWidth: 300,
    maxWidth: 300,
  },
});

/*
CLASSES
*/
interface DepositProps {
  provider: ethers.providers.Web3Provider | undefined;
  walletAddress: string;
  addTransaction: (timestamp: number, address: string) => void;
  tokens: TokenInfo[];
  getBooks: () => void;
  updateData: () => void;
}

/*
DEFAULT FUNCTION
*/
const Deposit: React.FC<DepositProps> = ({
  provider,
  walletAddress,
  addTransaction,
  tokens,
  getBooks,
  updateData,
}) => {
  const classes = useStyles();
  const [tokenSelectionDeposit, setTokenSelectionDeposit] = useState("");
  const [tokenSelectionWithdraw, setTokenSelectionWithdraw] = useState("");
  const [tokenQuantityDeposit, setTokenQuantityDeposit] = useState(0);
  const [tokenQuantityWithdraw, setTokenQuantityWithdraw] = useState(0);
  const [buttonLabelDeposit, setButtonLabelDeposit] =
    useState("Connect Wallet");
  const [buttonLabelWithdraw, setButtonLabelWithdraw] =
    useState("Connect Wallet");
  const [buttonDisabledDeposit, setButtonDisabledDeposit] = useState(true);
  const [buttonDisabledWithdraw, setButtonDisabledWithdraw] = useState(true);
  const [balanceStringDeposit, setBalanceStringDeposit] = useState("0");
  const [balanceStringWithdraw, setBalanceStringWithdraw] = useState("0");

  if (walletAddress !== "" && buttonLabelDeposit === "Connect Wallet") {
    setButtonLabelDeposit("Select Deposit");
    updateData();
  }
  if (walletAddress !== "" && buttonLabelWithdraw === "Connect Wallet") {
    setButtonLabelWithdraw("Select Withdrawal");
  }

  function newTokenSelectedDeposit(symbol: string) {
    updateDeposit(symbol, tokenQuantityDeposit);
  }
  function newTokenQuantityDeposit(quantity: number) {
    updateDeposit(tokenSelectionDeposit, quantity);
  }
  async function updateDeposit(symbol: string, quantity: number) {
    setTokenSelectionDeposit(symbol);
    setTokenQuantityDeposit(quantity);

    if (quantity <= 0 || symbol === "") {
      setButtonLabelDeposit("Invalid Quantity");
      setButtonDisabledDeposit(true);
      return;
    }
    const tokenBalance = await getTokenBalance(symbol);
    // const bookBalance = await getBookBalance(symbol);
    setBalanceStringDeposit(tokenBalance ? tokenBalance : "0");

    // Only show the button when the amount is successfully calculated
    // and the account has enough tokens to swap
    if (Number(tokenBalance) >= quantity) {
      setButtonLabelDeposit("Deposit");
      setButtonDisabledDeposit(false);
    } else {
      setButtonLabelDeposit("Invalid Quantity");
      setButtonDisabledDeposit(true);
    }
  }

  function newTokenSelectedWithdraw(symbol: string) {
    updateWithdraw(symbol, tokenQuantityWithdraw);
  }
  function newTokenQuantityWithdraw(quantity: number) {
    updateWithdraw(tokenSelectionWithdraw, quantity);
  }
  async function updateWithdraw(symbol: string, quantity: number) {
    setTokenSelectionWithdraw(symbol);
    setTokenQuantityWithdraw(quantity);

    if (quantity <= 0 || symbol === "") {
      setButtonLabelWithdraw("Invalid Quantity");
      setButtonDisabledWithdraw(true);
      return;
    }
    // const tokenBalance = await getTokenBalance(symbol);
    const bookBalance = await getBookBalance(symbol);
    setBalanceStringWithdraw(bookBalance ? bookBalance : "0");

    // Only show the button when the amount is successfully calculated
    // and the account has enough tokens to swap
    if (Number(bookBalance) >= quantity) {
      setButtonLabelWithdraw("Withdraw");
      setButtonDisabledWithdraw(false);
    } else {
      setButtonLabelWithdraw("Invalid Quantity");
      setButtonDisabledWithdraw(true);
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
    const token = new ethers.Contract(tokenAddress, DOXERC20.abi, signer);
    const decimals = await token.decimals();
    let res = ethers.utils.formatUnits(book, decimals);
    res = (+res).toFixed(4);
    // console.log("book: ", res, decimals);
    return res;
  }

  async function getTokenBalance(symbol: string) {
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
    const token = new ethers.Contract(tokenAddress, DOXERC20.abi, signer);
    const userBalance = await token.balanceOf(signerAddress);
    const decimals = await token.decimals();
    let res = ethers.utils.formatUnits(userBalance, decimals);
    res = (+res).toFixed(4);
    // console.log("balance: ", res, decimals);
    return res;
  }

  async function deposit() {
    await _deposit(tokenSelectionDeposit, tokenQuantityDeposit);
  }

  // The deposit amount set will be in token amounts with decimals
  // convert to to bignumber with the proper 00s to accomodate decimals
  async function _deposit(symbol: string, amount: number) {
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
      var tx = await token.approve(doxAddress, bigAmt);
      addTransaction(Date.now(), tx.hash);
      await tx.wait();
    } catch (error) {
      console.log(error);
      alert(
        "There was an error approving the tokens for transfer. Please try again."
      );
    }
    try {
      const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);
      tx = await dox.deposit(tokenAddress, bigAmt);
      addTransaction(Date.now(), tx.hash);
      await tx.wait();
    } catch (error) {
      console.log(error);
      if (!error.data.message) {
        return;
      }
      error.data.message.includes("INVALID_TOKEN_ADDRESS")
        ? alert("That token address is not valid.")
        : error.data.message.includes("INVALID_DEPOSIT_AMOUNT")
        ? alert("That deposit amount is not valid.")
        : error.data.message.includes("INSUFFICIENT_TOKEN_BALANCE")
        ? alert("You do not have enough tokens for that deposit.")
        : alert("There was an error completing the deposit. Please try again.");
    }

    // Refresh the token balance
    const tokenBalance = await getTokenBalance(symbol);
    // const bookBalance = await getBookBalance(symbol);
    setBalanceStringDeposit(tokenBalance ? tokenBalance : "0");
    getBooks();
  }

  async function withdraw() {
    await _withdraw(tokenSelectionWithdraw, tokenQuantityWithdraw);
  }

  async function _withdraw(symbol: string, amount: number) {
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
      const tx = await dox.withdraw(tokenAddress, bigAmt);
      addTransaction(Date.now(), tx.hash);
      await tx.wait();
    } catch (error) {
      console.log(error);
      if (!error.data.message) {
        return;
      }
      error.data.message.includes("INVALID_TOKEN_ADDRESS")
        ? alert("That token address is not valid.")
        : error.data.message.includes("INVALID_WITHDRAW_AMOUNT")
        ? alert("That withdrawal amount is not valid.")
        : error.data.message.includes("INSUFFICIENT_BOOK_BALANCE")
        ? alert("You do not have that many tokens to withdraw.")
        : alert("There was an error completing the deposit. Please try again.");
    }

    // Refresh the book balance
    // const tokenBalance = await getTokenBalance(symbol);
    const bookBalance = await getBookBalance(symbol);
    setBalanceStringWithdraw(bookBalance ? bookBalance : "0");
    getBooks();
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
  const tokenDeposit = (
    <Paper id="deposit">
      <div id="deposit-title">Paradox Deposit</div>
      <div id="token-menu">
        <div id="tokenmenu-label-top">Available L1 Balance</div>
        <TokenMenu
          label={String(balanceStringDeposit)}
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={newTokenSelectedDeposit}
          tokenQuantity={newTokenQuantityDeposit}
        />
        <div id="tokenmenu-label-bottom">L0 Deposit Amount</div>
      </div>
      <Button
        onClick={deposit}
        id="deposit-button"
        variant="contained"
        color="primary"
        disabled={buttonDisabledDeposit}
      >
        {buttonLabelDeposit}
      </Button>
    </Paper>
  );

  const tokenWithdraw = (
    <Paper id="withdraw">
      <div id="withdraw-title">Paradox Withdraw</div>
      <div id="token-menu">
        <div id="tokenmenu-label-top">Available L0 Balance</div>
        <TokenMenu
          label={String(balanceStringWithdraw)}
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={newTokenSelectedWithdraw}
          tokenQuantity={newTokenQuantityWithdraw}
        />
        <div id="tokenmenu-label-bottom">L1 Withdraw Amount</div>
      </div>
      <Button
        onClick={withdraw}
        id="withdraw-button"
        variant="contained"
        color="primary"
        disabled={buttonDisabledWithdraw}
      >
        {buttonLabelWithdraw}
      </Button>
    </Paper>
  );

  return (
    <div>
      <header className="App-header">
        <Paper id="deposit-note">
          <strong>Please Note: </strong>Deposit transfers Layer 1 tokens to
          Layer 0. At this time, only tokens created using the token factory
          contract (see "L1: Tokens" in the menu) are available for transfer to
          Layer 0.
        </Paper>
        {tokenDeposit}
        {tokenWithdraw}
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
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
                      ethers.utils.formatUnits(
                        token.userBalance,
                        token.decimals
                      )
                    ).toFixed(4)}
                  </StyledTableCell>
                </StyledTableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </header>
    </div>
  );
};

export default Deposit;
