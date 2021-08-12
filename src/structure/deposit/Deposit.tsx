import React, { useState } from "react";
import { ethers } from "ethers";
// import Input from "@material-ui/core/Input";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

import { colors } from "../../common/Formatting";
import "./Deposit.css";
import TokenMenu from "../tokens/TokenMenu";

import DOXERC20 from "../../contracts/DOXERC20.sol/DOXERC20.json";
import DOXERC20Factory from "../../contracts/DOXERC20Factory.sol/DOXERC20Factory.json";

/*
CLASSES
*/
interface DepositProps {
  doxAddress: string;
  tokenFactoryAddress: string;
  provider: ethers.providers.Web3Provider | undefined;
  walletAddress: string;
}

/*
DEFAULT FUNCTION
*/
const Deposit: React.FC<DepositProps> = ({
  doxAddress,
  tokenFactoryAddress,
  provider,
  walletAddress,
}) => {
  // const [user] = useAuthState(firebaseAppAuth);
  const [tokenSelection, setTokenSelection] = useState("");
  const [tokenQuantity, setTokenQuantity] = useState(0);
  const [buttonLabel, setButtonLabel] = useState("Connect Wallet");
  const [buttonDisabled, setButtonDisabled] = useState(true);
  const [balanceString, setBalanceString] = useState("0");

  if (walletAddress !== "" && buttonDisabled) {
    setButtonLabel("Deposit");
    setButtonDisabled(false);
  }

  function newTokenSelected(symbol: string) {
    setTokenSelection(symbol);
    getBalance(symbol);
  }

  async function getBalance(symbol: string) {
    if (!provider) {
      return;
    }
    const signer = provider.getSigner();
    console.log("signer: ", signer);
    if (!signer) {
      return;
    }

    // Get the token address from the token factory
    const tokenFactory = new ethers.Contract(
      tokenFactoryAddress,
      DOXERC20Factory.abi,
      signer
    );
    console.log("tokenFactory: ", tokenFactory);

    if (!tokenFactory) {
      return;
    }
    const tokenAddress: string = await tokenFactory.getToken(symbol);
    console.log("tokenAddress: ", tokenAddress);

    // Get the acount balance from the token
    const signerAddress = await signer.getAddress();
    const token1 = new ethers.Contract(tokenAddress, DOXERC20.abi, signer);
    const userBalance = await token1.balanceOf(signerAddress);
    const decimals = await token1.decimals();
    let res = ethers.utils.formatEther(userBalance);
    res = (+res).toFixed(4);
    console.log("balance: ", res, decimals);
    setBalanceString(res);
  }

  // PAGE CONTENT
  const tokenDeposit = (
    <Paper id="deposit">
      <div id="deposit-title">Paradox</div>
      <div id="token-menu">
        <TokenMenu
          label={String(balanceString)}
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={newTokenSelected}
          tokenQuantity={setTokenQuantity}
        />
      </div>
      <Button
        id="deposit-button"
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
      <header className="App-header">{tokenDeposit}</header>
    </div>
  );
};

export default Deposit;
