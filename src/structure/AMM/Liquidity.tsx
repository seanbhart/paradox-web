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

import "./Liquidity.css";
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
INTERFACES
*/
interface LiquidityProps {
  provider: ethers.providers.Web3Provider | undefined;
  walletAddress: string;
  addTransaction: (timestamp: number, address: string) => void;
  tokens: TokenInfo[];
  getBooks: () => void;
}

/*
DEFAULT FUNCTION
*/
const Liquidity: React.FC<LiquidityProps> = ({
  provider,
  walletAddress,
  addTransaction,
  tokens,
  getBooks,
}) => {
  const classes = useStyles();
  const [token1Selection, setToken1Selection] = useState("");
  const [token2Selection, setToken2Selection] = useState("");
  const [token1Quantity, setToken1Quantity] = useState(0);
  const [token2Quantity, setToken2Quantity] = useState(0);
  const [token1Pool, setToken1Pool] = useState(0);
  const [token2Pool, setToken2Pool] = useState(0);
  const [addButtonLabel, setAddButtonLabel] = useState("Connect Wallet");
  const [removeButtonLabel, setRemoveButtonLabel] = useState("Connect Wallet");
  const [buttonDisabled, setButtonDisabled] = useState(true);

  if (walletAddress !== "" && buttonDisabled) {
    setAddButtonLabel("Add Liquidity");
    setRemoveButtonLabel("Remove Liquidity");
    setButtonDisabled(false);
  }

  function tokenSelection(selection: string, isToken1: boolean) {
    if (isToken1) {
      setToken1Selection(selection);
      _findPair(selection, token2Selection);
    } else {
      setToken2Selection(selection);
      _findPair(token1Selection, selection);
    }
  }

  async function _findPair(token1Symbol: string, token2Symbol: string) {
    if (token1Symbol === "" || token2Symbol === "") {
      return;
    }
    if (!provider || doxAddress === "") {
      return;
    }
    const signer = provider.getSigner();
    const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);
    try {
      const token1Address = await _getToken(token1Symbol);
      const token2Address = await _getToken(token2Symbol);
      const [cpi, order] = await dox.findCPI(token1Address, token2Address);
      const token1 = new ethers.Contract(token1Address, DOXERC20.abi, signer);
      const token2 = new ethers.Contract(token2Address, DOXERC20.abi, signer);
      const decimals1 = await token1.decimals();
      const decimals2 = await token2.decimals();
      setToken1Pool(
        Number(ethers.utils.formatUnits(order ? cpi.a : cpi.b, decimals1))
      );
      setToken2Pool(
        Number(ethers.utils.formatUnits(order ? cpi.b : cpi.a, decimals2))
      );
    } catch (error) {
      console.log(error);
      alert("We're sorry, there was an error, please try again.");
    }
  }

  async function addLiquidity() {
    if (!provider) {
      return;
    }
    const signer = provider.getSigner();
    if (!signer) {
      return;
    }

    const token1Address = await _getToken(token1Selection);
    const token1 = new ethers.Contract(token1Address, DOXERC20.abi, signer);
    const decimals1 = await token1.decimals();
    const token2Address = await _getToken(token2Selection);
    const token2 = new ethers.Contract(token2Address, DOXERC20.abi, signer);
    const decimals2 = await token2.decimals();

    await _addLiquidity(
      token1Address,
      token2Address,
      token1Quantity,
      token2Quantity,
      decimals1,
      decimals2
    );

    // Update the pair balances and the account book balances
    _findPair(token1Selection, token2Selection);
    getBooks();
  }

  async function _addLiquidity(
    t1Address: string,
    t2Address: string,
    t1Quantity: number,
    t2Quantity: number,
    t1Decimals: number,
    t2Decimals: number
  ) {
    if (!provider || doxAddress === "") {
      return;
    }
    const signer = provider.getSigner();
    const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);

    const bigAmt1 = ethers.utils.parseUnits(t1Quantity.toString(), t1Decimals);
    const bigAmt2 = ethers.utils.parseUnits(t2Quantity.toString(), t2Decimals);
    try {
      const tx = await dox.addLiquidity(t1Address, t2Address, bigAmt1, bigAmt2);
      addTransaction(Date.now(), tx.hash);
      await tx.wait();
      // const [cpi, order] = await dox.findCPI(t1Address, t2Address);
      // console.log(
      //   "cpi: ",
      //   ethers.BigNumber.from(cpi.a).toString(),
      //   ethers.BigNumber.from(cpi.b).toString(),
      //   ethers.BigNumber.from(cpi.k).toString(),
      //   order
      // );
    } catch (error) {
      error.data.message.includes("INSUFFICIENT_BOOK_BALANCE")
        ? alert("You do not own enough tokens to deposit that amount.")
        : alert("There was an error when adding liquidity. Please try again.");
    }
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
  const liquidity = (
    <div className="liquidity">
      <div id="tokenliquidity-menus">
        <div id="tokenliquidity-label-top">Current L0 Liquidity</div>
        <TokenMenu
          label={(token1Pool ? token1Pool : 0).toString()}
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={(selection) => tokenSelection(selection, true)}
          tokenQuantity={setToken1Quantity}
        />
        <div id="tokenliquidity-label-top">Current L0 Liquidity</div>
        <TokenMenu
          label={(token2Pool ? token2Pool : 0).toString()}
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={(selection) => tokenSelection(selection, false)}
          tokenQuantity={setToken2Quantity}
        />
      </div>
      <div className="liquidity-button-container">
        <Button
          onClick={addLiquidity}
          id="add-button"
          className="liquidity-button"
          variant="contained"
          color="primary"
          disabled={buttonDisabled}
        >
          {addButtonLabel}
        </Button>
      </div>
      <div className="liquidity-button-container">
        <Button
          id="remove-button"
          className="liquidity-button"
          variant="contained"
          color="primary"
          disabled={true}
        >
          {removeButtonLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <header className="App-header">
        <Paper id="deposit-note">
          <strong>Please Note: </strong>LP Tokens and therefore liquidity
          withdrawal are not operational at this time.
        </Paper>
        <Paper id="liquidity">
          <div id="tokenliquidity-title">Paradox</div>
          {liquidity}
        </Paper>
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

export default Liquidity;
