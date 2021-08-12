import React, { useState } from "react";
// import withFirebaseAuth from 'react-with-firebase-auth'
// import { useAuthState } from 'react-firebase-hooks/auth';
import { ethers } from "ethers";

import Deposit from "./structure/deposit/Deposit";
import Header from "./structure/header/Header";
import Swap from "./structure/amm/Swap";
import Liquidity from "./structure/amm/Liquidity";
import Tokens from "./structure/tokens/Tokens";
// import { db, firebaseAppAuth, functions, storage } from "./firebase";
import { colors } from "./common/Formatting";
import "./App.css";

const tokenFactoryAddress: string =
  "0x1f10F3Ba7ACB61b2F50B9d6DdCf91a6f787C0E82";
const doxAddress: string = "0x457cCf29090fe5A24c19c1bc95F492168C0EaFdb";

/*
DEFAULT FUNCTION
*/
export default function App() {
  // const [user] = useAuthState(firebaseAppAuth);
  // const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [walletAddress, setWalletAddress] = useState("");
  const [menuSelection, setMenuSelection] = useState<number>(0);

  var content = (
    <Deposit
      doxAddress={doxAddress}
      tokenFactoryAddress={tokenFactoryAddress}
      provider={provider}
      walletAddress={walletAddress}
    />
  );
  switch (menuSelection) {
    case 1:
      content = (
        <Swap
          doxAddress={doxAddress}
          tokenFactoryAddress={tokenFactoryAddress}
          provider={provider}
          walletAddress={walletAddress}
        />
      );
      break;
    case 2:
      content = (
        <Liquidity
          doxAddress={doxAddress}
          tokenFactoryAddress={tokenFactoryAddress}
          provider={provider}
          walletAddress={walletAddress}
        />
      );
      break;
    case 3:
      content = (
        <Tokens
          tokenFactoryAddress={tokenFactoryAddress}
          provider={provider}
          walletAddress={walletAddress}
        />
      );
      break;
    default:
      break;
  }

  return (
    <div
      className="App"
      style={{
        backgroundColor: colors.background,
      }}
    >
      <Header
        setMenuSelect={setMenuSelection}
        setWalletAddr={setWalletAddress}
        setProvdr={setProvider}
      />
      <header className="App-header">{content}</header>
    </div>
  );
}
