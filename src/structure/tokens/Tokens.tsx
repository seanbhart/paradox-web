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

import { colors } from "../../common/Formatting";
import "./Tokens.css";

import DOXERC20 from "../../contracts/DOXERC20.sol/DOXERC20.json";
import DOXERC20Factory from "../../contracts/DOXERC20Factory.sol/DOXERC20Factory.json";

const StyledTableCell = withStyles((theme: Theme) =>
  createStyles({
    head: {
      backgroundColor: theme.palette.common.black,
      color: theme.palette.common.white,
    },
    body: {
      fontSize: 14,
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
interface TokenProps {
  tokenFactoryAddress: string;
  provider: ethers.providers.Web3Provider | undefined;
  walletAddress: string;
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
}) => {
  console.log("walletAddress: ", walletAddress);
  const classes = useStyles();
  // const [user] = useAuthState(firebaseAppAuth);
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenName, setTokenName] = useState("Paradox");
  const [tokenSymbol, setTokenSymbol] = useState("DOX");
  const [tokenOwnerBalance, setTokenOwnerBalance] = useState(
    ethers.BigNumber.from("1000000000000000000000000")
  );
  const [tokensCalled, setTokensCalled] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  // tokens.push(new TokenInfo("test", "TST", 18, ethers.BigNumber.from(100)));

  /*
  FUNCTIONS
  */
  async function createToken() {
    console.log(
      "Creating token: ",
      tokenSymbol,
      tokenName,
      tokenOwnerBalance.toString()
    );
    if (
      provider &&
      tokenName !== "" &&
      tokenSymbol !== "" &&
      tokenOwnerBalance > ethers.BigNumber.from(0)
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
          const transaction = await tokenFactory.createToken(
            tokenName,
            tokenSymbol,
            tokenOwnerBalance
          );
          await transaction.wait();
          setTokenAddress(await tokenFactory.getToken(tokenSymbol));

          // Reset the token list
          setTokens([]);
          tokenList();
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

  async function tokenBalance(
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
    const token1 = new ethers.Contract(tAddress, DOXERC20.abi, signer);
    const userBalance = await token1.balanceOf(signerAddress);
    const decimals = await token1.decimals();
    return [userBalance, decimals];
  }

  async function tokenList() {
    setTokensCalled(true);
    if (!provider) {
      return;
    }
    const signer = provider.getSigner();
    console.log("signer: ", signer);
    if (!signer) {
      return;
    }
    const tokenFactory = new ethers.Contract(
      tokenFactoryAddress,
      DOXERC20Factory.abi,
      signer
    );
    console.log("tokenFactory: ", tokenFactory);

    if (!tokenFactory) {
      return;
    }
    const tokenListLength: number = await tokenFactory.tokenListLength();
    console.log("tokenListLength: ", tokenListLength);
    if (tokenListLength <= 0) {
      return;
    }
    for (var i = 0; i < tokenListLength; i++) {
      const tokenSymbol: string = await tokenFactory.tokenList(i);
      const tokenAddress: string = await tokenFactory.getToken(tokenSymbol);

      const token = new ethers.Contract(tokenAddress, DOXERC20.abi, signer);
      const tokenName: string = await token.name();
      const [balance, decimals] = await tokenBalance(tokenAddress);
      console.log("token: ", tokenAddress);
      const newTokenInfo = new TokenInfo(
        tokenAddress,
        tokenName,
        tokenSymbol,
        decimals,
        balance
      );
      setTokens((tokens) => [...tokens, newTokenInfo]);
    }
  }

  // DO ON LOAD
  if (!tokensCalled && walletAddress) {
    tokenList();
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
      <label className="token-input-label">Token Creator Initial Balance</label>
      <input
        onChange={(e) =>
          setTokenOwnerBalance(ethers.BigNumber.from(e.target.value))
        }
        id="token-input-balance"
        className="token-input"
        // type="number"
        value={tokenOwnerBalance.toString()}
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
        {createTokenForm}
        <TableContainer component={Paper}>
          <Table className={classes.table} aria-label="simple table">
            <TableHead>
              <TableRow>
                <StyledTableCell>Symbol</StyledTableCell>
                <StyledTableCell align="right">Token Name</StyledTableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tokens.map((token) => (
                <StyledTableRow key={token.symbol}>
                  <StyledTableCell component="th" scope="row">
                    {token.symbol}
                  </StyledTableCell>
                  <StyledTableCell align="right">{token.name}</StyledTableCell>
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
