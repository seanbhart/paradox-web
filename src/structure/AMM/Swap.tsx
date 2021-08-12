import React, { useState } from "react";
import { ethers } from "ethers";
// import Input from "@material-ui/core/Input";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

import { colors } from "../../common/Formatting";
import "./Swap.css";
import TokenMenu from "../tokens/TokenMenu";

import DOXERC20 from "../../contracts/DOXERC20.sol/DOXERC20.json";
import DOXERC20Factory from "../../contracts/DOXERC20Factory.sol/DOXERC20Factory.json";

/*
CLASSES
*/
interface SwapProps {
  doxAddress: string;
  tokenFactoryAddress: string;
  provider: ethers.providers.Web3Provider | undefined;
  walletAddress: string;
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
}) => {
  // const [user] = useAuthState(firebaseAppAuth);
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

  // PAGE CONTENT
  const tokenSwap = (
    <Paper id="swap">
      <div id="tokenswap-title">Paradox</div>
      <div id="token-menus">
        <TokenMenu
          label="test"
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={setToken1Selection}
          tokenQuantity={setToken1Quantity}
        />
        <TokenMenu
          label="test"
          tokenFactoryAddress={tokenFactoryAddress}
          tokenSelect={setToken2Selection}
          tokenQuantity={setToken2Quantity}
        />
      </div>
      <Button
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
      <header className="App-header">{tokenSwap}</header>
    </div>
  );
};

export default Swap;
