import React, { useState } from "react";
import { ethers } from "ethers";
import {
  withStyles,
  Theme,
  createStyles,
  makeStyles,
} from "@material-ui/core/styles";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Paper from "@material-ui/core/Paper";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";

import "./Tokens.css";
import DOXERC20 from "../../contracts/DOXERC20.sol/DOXERC20.json";
import DOXERC20Factory from "../../contracts/DOXERC20Factory.sol/DOXERC20Factory.json";

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
    minWidth: 400,
    maxWidth: 400,
  },
});

/*
INTERFACES
*/
interface TokenProps {
  tokenFactoryAddress: string;
  provider: ethers.providers.Web3Provider | undefined;
  walletAddress: string;
  addTransaction: (timestamp: number, address: string) => void;
}

/*
CLASSES
*/
export class TokenInfo {
  constructor(
    public address: string,
    public name: string,
    public symbol: string,
    public decimals: number,
    public userBalance: ethers.BigNumber
  ) {}
}

/*
DEFAULT FUNCTION
*/
const Tokens: React.FC<TokenProps> = ({
  tokenFactoryAddress,
  provider,
  walletAddress,
  addTransaction,
}) => {
  const classes = useStyles();
  const [tokenName, setTokenName] = useState("Paradox");
  const [tokenSymbol, setTokenSymbol] = useState("DOX");
  const [tokenOwnerBalance, setTokenOwnerBalance] = useState(1000000);
  // const [tokenOwnerBalance, setTokenOwnerBalance] = useState(
  //   ethers.BigNumber.from("1000000000000000000000000")
  // );
  const [tokensCalled, setTokensCalled] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  // tokens.push(new TokenInfo("test", "TST", 18, ethers.BigNumber.from(100)));

  /*
  FUNCTIONS
  */
  async function createToken() {
    // console.log(
    //   "Creating token: ",
    //   tokenSymbol,
    //   tokenName,
    //   tokenOwnerBalance.toString()
    // );
    if (
      provider &&
      tokenName !== "" &&
      tokenSymbol !== "" &&
      tokenOwnerBalance > 0
    ) {
      const signer = provider.getSigner();
      if (signer) {
        // const signerAddress = await signer.getAddress();
        // console.log(signerAddress);
        const tokenFactory = new ethers.Contract(
          tokenFactoryAddress,
          DOXERC20Factory.abi,
          signer
        );
        try {
          const tx = await tokenFactory.createToken(
            tokenName,
            tokenSymbol,
            ethers.utils.parseUnits(tokenOwnerBalance.toString(), 18)
          );
          addTransaction(Date.now(), tx.hash);
          await tx.wait();
          // setTokenAddress(await tokenFactory.getToken(tokenSymbol));

          // Reset the token list
          setTokens([]);
          getTokens();
        } catch (error) {
          error.data.message.includes("TOKEN_EXISTS")
            ? alert("That token already exists.")
            : alert(
                "There was an error when creating that token. Please try again."
              );
        }
      }
    }
  }

  async function _tokenBalance(
    tAddress: string
  ): Promise<[ethers.BigNumber, number]> {
    if (!provider) {
      return [ethers.BigNumber.from(0), 0];
    }
    const signer = provider.getSigner();
    if (!signer) {
      return [ethers.BigNumber.from(0), 0];
    }
    const signerAddress = await signer.getAddress();
    const token = new ethers.Contract(tAddress, DOXERC20.abi, signer);
    const userBalance = await token.balanceOf(signerAddress);
    const decimals = await token.decimals();
    return [userBalance, decimals];
  }

  async function getTokens() {
    setTokensCalled(true);
    if (!provider) {
      return;
    }
    const signer = provider.getSigner();
    if (!signer) {
      return;
    }
    const tokenFactory = new ethers.Contract(
      tokenFactoryAddress,
      DOXERC20Factory.abi,
      signer
    );

    if (!tokenFactory) {
      return;
    }
    // TODO: tokenFactory.tokenListLength() called twice? Function not awaitable?
    const tokenListLength: number = await tokenFactory.tokenListLength();
    if (tokenListLength <= 0) {
      return;
    }
    var newTokensList = [];
    for (var i = 0; i < Number(tokenListLength); i++) {
      const tokenSymbol: string = await tokenFactory.tokenList(i);
      const tokenAddress: string = await tokenFactory.getToken(tokenSymbol);

      const token = new ethers.Contract(tokenAddress, DOXERC20.abi, signer);
      const tokenName: string = await token.name();
      const [balance, decimals] = await _tokenBalance(tokenAddress);
      const newTokenInfo = new TokenInfo(
        tokenAddress,
        tokenName,
        tokenSymbol,
        decimals,
        balance
      );

      // Don't add the token to the list if it already exists
      if (
        newTokensList.filter((t) => t.address === tokenAddress).length === 0
      ) {
        newTokensList.push(newTokenInfo);
      }
    }
    setTokens(newTokensList);
  }

  // DO ON LOAD
  if (!tokensCalled && walletAddress) {
    setTokens([]);
    getTokens();

    // addTransaction(
    //   Date.now(),
    //   "0xeb36bdc46e4a737847d549b231bd1f2a148c0bb854b94463ebb010adadd38352"
    // );
  }

  // PAGE CONTENT
  const createTokenForm = (
    <Paper id="token-form">
      <label className="token-input-label">Token Name</label>
      <input
        onChange={(e) => setTokenName(e.target.value)}
        // placeholder="Token Name"
        id="token-input-name"
        className="token-input"
        type="text"
        value={tokenName}
      />
      <label className="token-input-label">Token Symbol</label>
      <input
        onChange={(e) => setTokenSymbol(e.target.value)}
        id="token-input-symbol"
        className="token-input"
        type="text"
        value={tokenSymbol}
      />
      <label className="token-input-label">
        Token Creator Initial Balance (whole tokens)
      </label>
      <input
        onChange={(e) => setTokenOwnerBalance(Number(e.target.value))}
        id="token-input-balance"
        className="token-input"
        // type="number"
        value={(tokenOwnerBalance ? tokenOwnerBalance : 0).toString()}
      />
      <Button
        onClick={createToken}
        id="create-button"
        variant="contained"
        color="primary"
      >
        CREATE TOKEN
      </Button>
    </Paper>
  );

  return (
    <div>
      <header className="App-header">
        <Paper id="tokens-note">
          <strong>Please Note: </strong>These tokens are created on Layer 1, not
          inside Paradox (Layer 0). They can be utilized in any other testnet
          protocol.
          <br />
          <br />
          Use the "L0: Deposit" function (in the top left menu) to move your L1
          balance to L0.
        </Paper>
        {createTokenForm}
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Symbol</StyledTableCell>
                <StyledTableCell align="left">Token Name</StyledTableCell>
                <StyledTableCell>Etherscan</StyledTableCell>
                <StyledTableCell align="right">Your L1 Balance</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tokens.map((token) => (
                <StyledTableRow key={token.symbol}>
                  <StyledTableCell component="th" scope="row">
                    {token.symbol}
                  </StyledTableCell>
                  <StyledTableCell align="left">{token.name}</StyledTableCell>
                  <StyledTableCell>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={"https://etherscan.io/tx/" + token.address}
                    >
                      <OpenInNewIcon className="token-link-icon" />
                    </a>
                  </StyledTableCell>
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
export default Tokens;
