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

import "./Swap.css";
import { tokenFactoryAddress, doxAddress } from "../../setup";
import { TokenInfo } from "../tokens/Tokens";
import TokenMenu from "../tokens/TokenMenu";
import TokenMenuSolo from "../tokens/TokenMenuSolo";
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
interface SwapProps {
  provider: ethers.providers.Web3Provider | undefined;
  walletAddress: string;
  addTransaction: (
    timestamp: number,
    address: string,
    pending: boolean
  ) => void;
  tokens: TokenInfo[];
  getBooks: () => void;
  updateData: () => void;
}

/*
DEFAULT FUNCTION
*/
// export default function Swap() {
const Swap: React.FC<SwapProps> = ({
  provider,
  walletAddress,
  addTransaction,
  tokens,
  getBooks,
  updateData,
}) => {
  const classes = useStyles();
  const [token1Selection, setToken1Selection] = useState("");
  const [token2Selection, setToken2Selection] = useState("");
  const [token1Quantity, setToken1Quantity] = useState(0);
  const [token2Quantity, setToken2Quantity] = useState(0);
  const [token1Available, setToken1Available] = useState(0);
  // const [token1Pool, setToken1Pool] = useState(0);
  // const [token2Pool, setToken2Pool] = useState(0);
  const [buttonLabel, setButtonLabel] = useState("Connect Wallet");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [priceCurrent, setPriceCurrent] = useState(0.0);
  const [priceOutput, setPriceOutput] = useState(0.0);

  if (walletAddress !== "" && buttonLabel === "Connect Wallet") {
    setButtonLabel("Choose Tokens");
    updateData();
  }

  // // TODO: Finish check and reset
  // function updateToken1(symbol: string) {
  //   // Ensure the selected token is not already chosen
  //   // by the other token selection
  //   if (symbol !== token2Selection) {
  //     setToken1Selection(symbol);
  //   } else {
  //     setToken1Selection("");
  //   }
  // }

  // // TODO: Finish check and reset
  // function updateToken2(symbol: string) {
  //   // Ensure the selected token is not already chosen
  //   // by the other token selection
  //   if (symbol !== token1Selection) {
  //     setToken2Selection(symbol);
  //   } else {
  //     setToken2Selection("");
  //   }
  // }

  async function updateQuantity(quantity: number) {
    if (quantity <= 0) {
      setButtonLabel("Invalid Quantity");
      setButtonDisabled(true);
      return;
    }
    setToken1Quantity(quantity);

    // Use the DOX contract to calculate the estimate output
    // for the provided input for these tokens
    if (token1Selection === "" && token2Selection === "") {
      return;
    }
    if (!provider) {
      return;
    }
    const signer = provider.getSigner();
    if (!signer) {
      return;
    }

    try {
      const token1Address = await _getToken(token1Selection);
      const token1 = new ethers.Contract(token1Address, DOXERC20.abi, signer);
      const decimals1 = await token1.decimals();
      const bigAmt1 = ethers.utils.parseUnits(quantity.toString(), decimals1);

      const token2Address = await _getToken(token2Selection);
      const token2 = new ethers.Contract(token2Address, DOXERC20.abi, signer);
      const decimals2 = await token2.decimals();

      const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);
      const [, , output] = await dox.swapCalc(
        token1Address,
        token2Address,
        bigAmt1
      );

      const [cpi, order] = await dox.findCPI(token1Address, token2Address);
      // console.log(
      //   "cpi: ",
      //   ethers.BigNumber.from(cpi.a).toString(),
      //   ethers.BigNumber.from(cpi.b).toString(),
      //   ethers.BigNumber.from(cpi.k).toString(),
      //   aIsToken1
      // );
      const t1Pool: number = Number(
        ethers.utils.formatUnits(order ? cpi.a : cpi.b, decimals1)
      );
      const t2Pool: number = Number(
        ethers.utils.formatUnits(order ? cpi.b : cpi.a, decimals2)
      );
      // setToken1Pool(t1Pool);
      // setToken2Pool(t2Pool);
      setPriceCurrent(t2Pool / t1Pool);

      const outputNum = Number(ethers.utils.formatUnits(output, decimals2));
      setToken2Quantity(outputNum);
      setPriceOutput(outputNum / quantity);

      let userBal = 0;
      // Find the input token for the current account to check available quantity.
      tokens.every((token) => {
        if (token.address === token1Address) {
          userBal = Number(
            ethers.utils.formatUnits(token.userBalance, decimals1)
          );
          setToken1Available(userBal);
          return false;
        }
        return true;
      });

      if (userBal >= quantity) {
        // Only show the swap button when the output is successfully calculated
        // and the account has enough tokens to swap
        setButtonLabel("Swap");
        setButtonDisabled(false);
      } else {
        setButtonLabel("Invalid Quantity");
        setButtonDisabled(true);
      }
    } catch (error) {
      console.log(error);
      if (!error.data.message) {
        return;
      }
      error.data.message.includes("TOKEN_PAIR_NOT_FOUND")
        ? alert(
            "That liquidity pool does not exist. Go to 'L0: Liquidity' in the menu and add liquidity to the pair pool."
          )
        : alert("There was an error. Please try again.");
    }
  }

  async function swap() {
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

    await _swap(
      token1Address,
      token2Address,
      token1Quantity,
      decimals1,
      decimals2
    );

    getBooks();
  }

  async function _swap(
    t1Address: string,
    t2Address: string,
    t1Quantity: number,
    t1Decimals: number,
    t2Decimals: number
  ) {
    if (!provider || doxAddress === "") {
      return;
    }
    const signer = provider.getSigner();
    const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);

    const bigAmt1 = ethers.utils.parseUnits(t1Quantity.toString(), t1Decimals);
    try {
      const tx = await dox.swap(t1Address, t2Address, bigAmt1);
      addTransaction(Date.now(), tx.hash, true);
      await tx.wait();
      addTransaction(Date.now(), tx.hash, false);
      // const [cpi, order] = await dox.findCPI(t1Address, t2Address);
      // console.log(
      //   "cpi: ",
      //   ethers.BigNumber.from(cpi.a).toString(),
      //   ethers.BigNumber.from(cpi.b).toString(),
      //   ethers.BigNumber.from(cpi.k).toString(),
      //   order
      // );

      // Update the swap calc so the preview amount is now correct
      // with the new slippage calc
      updateQuantity(token1Quantity);
    } catch (error) {
      console.log(error);
      if (!error.data.message) {
        return;
      }
      error.data.message.includes("INSUFFICIENT_BOOK_BALANCE")
        ? alert("You do not own enough tokens to deposit that amount.")
        : alert("There was an error during the swap. Please try again.");
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
  const tokenSwap = (
    <Paper id="swap">
      <div id="tokenswap-title">Paradox</div>
      <div id="token-menus">
        <div className="tokenswap-label-top">Your L0 Balance</div>
        <TokenMenu
          label={(token1Available ? token1Available : 0).toFixed(4)}
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={setToken1Selection}
          tokenQuantity={updateQuantity}
        />
        {/* <div className="tokenswap-label-top">Output Price</div> */}
        <TokenMenuSolo
          // label="Est. Ouput"
          label={"Price: " + (priceOutput ? priceOutput : 0).toFixed(4)}
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={setToken2Selection}
          tokenQuantity={token2Quantity}
        />
        {/* <div className="tokenswap-label-bottom">
          {"Remaining Pool Tokens: " + (token2Pool ? token2Pool : 0).toFixed(4)}
        </div> */}
      </div>
      <div>
        <div className="tokenswap-label-info">
          {"Current Price: " + (priceCurrent ? priceCurrent : 0).toFixed(4)}
        </div>
        <div className="tokenswap-label-info">
          {"Swap Price: " + (priceOutput ? priceOutput : 0).toFixed(4)}
        </div>
        <div className="tokenswap-label-info">
          {"Slippage: " +
            (priceCurrent && priceOutput
              ? ((priceCurrent - priceOutput) / priceCurrent) * 100
              : 0
            ).toFixed(2) +
            "%"}
        </div>
      </div>
      <Button
        onClick={swap}
        id="swap-button"
        variant="contained"
        color="primary"
        disabled={buttonDisabled}
      >
        {buttonLabel}
      </Button>
    </Paper>
  );

  return (
    <div>
      <header className="App-header">
        {tokenSwap}
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

export default Swap;
