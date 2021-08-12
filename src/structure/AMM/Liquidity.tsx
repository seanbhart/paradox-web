import React, { useState } from "react";
import { ethers } from "ethers";
// import Input from "@material-ui/core/Input";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";

import { colors } from "../../common/Formatting";
import "./Liquidity.css";
import TokenMenu from "../tokens/TokenMenu";

import DOXERC20 from "../../contracts/DOXERC20.sol/DOXERC20.json";
import DOXERC20Factory from "../../contracts/DOXERC20Factory.sol/DOXERC20Factory.json";
import ParadoxV1 from "../../contracts/ParadoxV1.sol/ParadoxV1.json";

/*
INTERFACES
*/
interface LiquidityProps {
  doxAddress: string;
  tokenFactoryAddress: string;
  provider: ethers.providers.Web3Provider | undefined;
  walletAddress: string;
}

/*
DEFAULT FUNCTION
*/
const Liquidity: React.FC<LiquidityProps> = ({
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
  const [addButtonLabel, setAddButtonLabel] = useState("Connect Wallet");
  const [removeButtonLabel, setRemoveButtonLabel] = useState("Connect Wallet");
  const [buttonDisabled, setButtonDisabled] = useState(true);

  if (walletAddress !== "" && buttonDisabled) {
    setAddButtonLabel("Add Liquidity");
    setRemoveButtonLabel("Remove Liquidity");
    setButtonDisabled(false);
  }

  async function addLiquidity(t1Address: string, t2Address: string) {
    if (!provider || doxAddress === "") {
      return;
    }
    const signer = provider.getSigner();
    const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);
    try {
      const tx = await dox.addLiquidity(
        t1Address,
        t2Address,
        10000000,
        10000000
      );
      tx.wait();
      const [cpi, order] = await dox.findCPI(t1Address, t2Address);
      console.log(
        "cpi: ",
        ethers.BigNumber.from(cpi.x).toString(),
        ethers.BigNumber.from(cpi.y).toString(),
        ethers.BigNumber.from(cpi.k).toString(),
        order
      );
    } catch (error) {
      error.data.message.includes("INSUFFICIENT BOOK BALANCE")
        ? alert("You do not own enough tokens to deposit that amount.")
        : alert("There was an error when adding liquidity. Please try again.");
    }
  }
  addLiquidity(
    "0xed65322e19B7517cee5c880b112f6f60f8A158aE",
    "0x315B1215EBBbE21bD6c2cDb024ECc4C1abe07814"
  );

  // PAGE CONTENT
  const liquidity = (
    <div className="liquidity">
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
      <div className="liquidity-button-container">
        <Button
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
          disabled={buttonDisabled}
        >
          {removeButtonLabel}
        </Button>
      </div>
    </div>
  );

  return (
    <div>
      <header className="App-header">
        <Paper id="liquidity">
          <div id="tokenswap-title">Paradox</div>
          {liquidity}
        </Paper>
      </header>
    </div>
  );
};

export default Liquidity;
