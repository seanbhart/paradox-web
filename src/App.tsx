import React, { useState } from "react";
// import withFirebaseAuth from 'react-with-firebase-auth'
// import { useAuthState } from 'react-firebase-hooks/auth';
import { ethers } from "ethers";

import Deposit from "./structure/deposit/Deposit";
import Header from "./structure/header/Header";
import Swap from "./structure/amm/Swap";
import Liquidity from "./structure/amm/Liquidity";
import Tokens, { TokenInfo } from "./structure/tokens/Tokens";
import Transactions from "./structure/transactions/Transactions";
// import { db, firebaseAppAuth, functions, storage } from "./firebase";
import { colors } from "./common/Formatting";
import "./App.css";

import DOXERC20 from "./contracts/DOXERC20.sol/DOXERC20.json";
import DOXERC20Factory from "./contracts/DOXERC20Factory.sol/DOXERC20Factory.json";
import ParadoxV1 from "./contracts/ParadoxV1.sol/ParadoxV1.json";

const tokenFactoryAddress: string =
  "0x8bEe2037448F096900Fd9affc427d38aE6CC0350";
const doxAddress: string = "0x942ED2fa862887Dc698682cc6a86355324F0f01e";

/*
CLASSES
*/
export class TransactionInfo {
  constructor(public timestamp: number, public address: string) {}
}

/*
DEFAULT FUNCTION
*/
export default function App() {
  // const [user] = useAuthState(firebaseAppAuth);
  // const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [walletAddress, setWalletAddress] = useState("");
  const [menuSelection, setMenuSelection] = useState<number>(0);
  const [transactions, setTransactions] = useState<TransactionInfo[]>([]);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [tokensChecked, setTokensChecked] = useState(false);

  if (!tokensChecked) {
    if (provider) {
      const signer = provider.getSigner();
      if (signer) {
        setTokensChecked(true);
        getBooks();
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

  async function getBooks() {
    if (!provider) {
      return;
    }
    const signer = provider.getSigner();
    if (!signer) {
      return;
    }
    const signerAddress = await signer.getAddress();
    const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);

    // Get the list of tokens owned on L0 by this account
    const tokenListLength = await dox.getBookListLength(signerAddress);
    var newTokensList = [];
    for (var i = 0; i < Number(tokenListLength); i++) {
      const tokenAddress = await dox.getBookList(signerAddress, i);
      const book = await dox.getBook(signerAddress, tokenAddress);
      const token = new ethers.Contract(tokenAddress, DOXERC20.abi, signer);
      const tokenName: string = await token.name();
      const tokenSymbol: string = await token.symbol();
      const [balance, decimals] = await _tokenBalance(tokenAddress);
      const newTokenInfo = new TokenInfo(
        tokenAddress,
        tokenName,
        tokenSymbol,
        decimals,
        book
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

  function addTransaction(timestamp: number, address: string) {
    let txs = transactions;
    // Limit to 10 transactions
    if (transactions.length > 10) {
      txs.shift();
    }
    txs.push(new TransactionInfo(timestamp, address));
    setTransactions([]);
    setTransactions(txs);
  }

  function clearTransactions() {
    setTransactions([]);
  }

  var content = (
    <Tokens
      tokenFactoryAddress={tokenFactoryAddress}
      provider={provider}
      walletAddress={walletAddress}
      addTransaction={addTransaction}
    />
  );
  switch (menuSelection) {
    case 1:
      content = (
        <Deposit
          doxAddress={doxAddress}
          tokenFactoryAddress={tokenFactoryAddress}
          provider={provider}
          walletAddress={walletAddress}
          addTransaction={addTransaction}
          tokens={tokens}
          getBooks={getBooks}
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
          addTransaction={addTransaction}
          tokens={tokens}
          getBooks={getBooks}
        />
      );
      break;
    case 3:
      content = (
        <Swap
          doxAddress={doxAddress}
          tokenFactoryAddress={tokenFactoryAddress}
          provider={provider}
          walletAddress={walletAddress}
          addTransaction={addTransaction}
          tokens={tokens}
          getBooks={getBooks}
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
      <header className="App-header">
        {content}
        <Transactions
          transactions={transactions}
          clearTransactions={clearTransactions}
        />
      </header>
    </div>
  );
}
