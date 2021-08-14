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
  doxAddress: string;
  tokenFactoryAddress: string;
  provider: ethers.providers.Web3Provider | undefined;
  walletAddress: string;
  addTransaction: (timestamp: number, address: string) => void;
  tokens: TokenInfo[];
  getBooks: () => void;
}

/*
DEFAULT FUNCTION
*/
// export default function Swap() {
const Swap: React.FC<SwapProps> = ({
  doxAddress,
  tokenFactoryAddress,
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
  const [buttonLabel, setButtonLabel] = useState("Connect Wallet");
  const [buttonDisabled, setButtonDisabled] = useState(true);

  if (walletAddress !== "" && buttonDisabled) {
    setButtonLabel("Swap");
    setButtonDisabled(false);
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
    const token1Address = await _getToken(token1Selection);
    const token1 = new ethers.Contract(token1Address, DOXERC20.abi, signer);
    const decimals1 = await token1.decimals();
    const bigAmt1 = ethers.utils.parseUnits(quantity.toString(), decimals1);

    const token2Address = await _getToken(token2Selection);
    const token2 = new ethers.Contract(token2Address, DOXERC20.abi, signer);
    const decimals2 = await token2.decimals();
    const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);
    const [cpi, aIsToken1, output] = await dox.swapCalc(
      token1Address,
      token2Address,
      bigAmt1
    );

    // const [cpi, order] = await dox.findCPI(token1Address, token2Address);
    // console.log(
    //   "cpi: ",
    //   ethers.BigNumber.from(cpi.a).toString(),
    //   ethers.BigNumber.from(cpi.b).toString(),
    //   ethers.BigNumber.from(cpi.k).toString(),
    //   aIsToken1
    // );

    const outputNum = Number(ethers.utils.formatUnits(output, decimals2));
    setToken2Quantity(outputNum);
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

      // Update the swap calc so the preview amount is now correct
      // with the new slippage calc
      updateQuantity(token1Quantity);
    } catch (error) {
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
        <TokenMenu
          label="Input"
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={setToken1Selection}
          tokenQuantity={updateQuantity}
        />
        <TokenMenuSolo
          label="Est. Ouput"
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={setToken2Selection}
          tokenQuantity={token2Quantity}
        />
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
