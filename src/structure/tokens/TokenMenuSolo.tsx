import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
// import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import TextField from "@material-ui/core/TextField";
import "./TokenMenu.css";

import { ethers } from "ethers";
import DOXERC20 from "../../contracts/DOXERC20.sol/DOXERC20.json";
import DOXERC20Factory from "../../contracts/DOXERC20Factory.sol/DOXERC20Factory.json";
import { TokenInfo } from "../tokens/Tokens";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "& > *": {
        margin: theme.spacing(1),
        // marginLeft: 10,
        width: 120,
        // fontSize: 20,
        // fontFamily: "Ubuntu";
      },
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 140,
      maxWidth: 140,
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  })
);

/*
INTERFACES
*/
interface TokenMenuSoloProps {
  tokenFactoryAddress: string;
  label: string;
  tokenSelect: (selected: string) => void;
  tokenQuantity: number;
}

const TokenMenuSolo: React.FC<TokenMenuSoloProps> = ({
  tokenFactoryAddress,
  label,
  tokenSelect,
  tokenQuantity,
}) => {
  const classes = useStyles();
  const [tokensCalled, setTokensCalled] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [tokenSelected, setTokenSelected] = useState("");

  const handleClose = () => {
    // setAnchorEl(null);
  };

  const handleSelect = (token: string) => {
    handleClose();
    setTokenSelected(token);
    tokenSelect(token);
    // console.log(token);
  };

  // request access to the user's MetaMask account
  async function requestAccount() {
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
  }

  async function tokenBalance(
    tAddress: string
  ): Promise<[ethers.BigNumber, number]> {
    if (typeof (window as any).ethereum !== "undefined" && tAddress !== "") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const signer = provider.getSigner();
      const signerAddress = await signer.getAddress();
      const token1 = new ethers.Contract(tAddress, DOXERC20.abi, signer);
      const userBalance = await token1.balanceOf(signerAddress);
      const decimals = await token1.decimals();
      return [userBalance, decimals];
    } else {
      return [ethers.BigNumber.from(0), 0];
    }
  }

  async function tokenList() {
    if (typeof (window as any).ethereum !== "undefined") {
      setTokensCalled(true);
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const signer = provider.getSigner();
      if (!signer) {
        return;
      }
      const signerAddress = signer.getAddress();
      const tokenFactory = new ethers.Contract(
        tokenFactoryAddress,
        DOXERC20Factory.abi,
        signer
      );

      try {
        if (tokenFactory) {
          const tokenListLength: number = await tokenFactory.tokenListLength();
          if (tokenListLength > 0) {
            for (var i = 0; i < tokenListLength; i++) {
              const tokenSymbol: string = await tokenFactory.tokenList(i);
              const tokenAddress: string = await tokenFactory.getToken(
                tokenSymbol
              );

              const token = new ethers.Contract(
                tokenAddress,
                DOXERC20.abi,
                signer
              );
              const tokenName: string = await token.name();
              const usedFaucet: boolean = await token.usedFaucet(signerAddress);
              const [balance, decimals] = await tokenBalance(tokenAddress);
              const tokenInfo = new TokenInfo(
                tokenAddress,
                tokenName,
                tokenSymbol,
                decimals,
                balance,
                usedFaucet
              );
              setTokens((tokens) => [...tokens, tokenInfo]);
            }
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  // DO ON LOAD
  if (!tokensCalled) {
    tokenList();
  }

  return (
    <div>
      <div id="form-left">
        <FormControl variant="filled" className={classes.formControl}>
          <InputLabel id="token-select-1">{tokenSelected}</InputLabel>
          <Select
            labelId="token-select-1-label"
            id="token-select-1-select"
            value={""}
            onChange={handleClose}
          >
            {tokens.map((token) => (
              <MenuItem
                // hover={false}
                key={token.symbol}
                onClick={() => handleSelect(token.symbol)}
                style={{
                  width: "300px",
                }}
              >
                {token.symbol}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div id="form-right">
        <TextField
          id="filled-basic"
          className={classes.root}
          label={label}
          //   placeholder="0.0"
          variant="filled"
          value={tokenQuantity.toFixed(4)}
          disabled={true}
        />
      </div>
    </div>
  );
};
export default TokenMenuSolo;
