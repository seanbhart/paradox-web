import React, { useState } from "react";
// import withFirebaseAuth from 'react-with-firebase-auth'
// import { useAuthState } from 'react-firebase-hooks/auth';
// import { db, firebaseAppAuth, functions, storage } from "./firebase";
import { ethers } from "ethers";

import Deposit from "./structure/deposit/Deposit";
import Header from "./structure/header/Header";
import Swap from "./structure/amm/Swap";
import Liquidity from "./structure/amm/Liquidity";
import Transfer from "./structure/transfer/Transfer";
import Tokens, { TokenInfo } from "./structure/tokens/Tokens";
import Transactions from "./structure/transactions/Transactions";
import { colors } from "./common/Formatting";
import "./App.css";

import DOXERC20 from "./contracts/DOXERC20.sol/DOXERC20.json";
import ParadoxV1 from "./contracts/ParadoxV1.sol/ParadoxV1.json";

export const etherscanTxUrl: string = "https://kovan.etherscan.io/tx/";
export const etherscanTokenUrl: string = "https://kovan.etherscan.io/token/";
export const tokenFactoryAddress: string =
  "0xa6AB32d541e8368caDe2f71038f3334AafBb75DA";
export const doxAddress: string = "0x59cfc18BCF6960870c73505b5b454BF174E7Bc4B";

/*
CLASSES
*/
export class TransactionInfo {
  constructor(public timestamp: number, public address: string) {}
}
export class AccountInfo {
  constructor(
    public address: string // public name: string, // public balance: ethers.BigNumber
  ) {}
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
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  const [accountsChecked, setAccountsChecked] = useState(false);
  const [tokens, setTokens] = useState<TokenInfo[]>([]);
  const [tokensChecked, setTokensChecked] = useState(false);

  // DO ON LOAD
  if (!tokensChecked) {
    if (provider) {
      const signer = provider.getSigner();
      if (signer) {
        getBooks();
      }
    }
  }
  if (!accountsChecked) {
    if (provider) {
      const signer = provider.getSigner();
      if (signer) {
        getAccounts();
      }
    }
  }

  function updateData() {
    getBooks();
    getAccounts();
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
    setTokensChecked(true);
    const signerAddress = await signer.getAddress();
    const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);

    try {
      // Get the list of tokens owned on L0 by this account
      const tokenListLength = await dox.getBookListLength(signerAddress);
      var newTokensList = [];
      for (var i = 0; i < Number(tokenListLength); i++) {
        const tokenAddress = await dox.getBookList(signerAddress, i);
        const book = await dox.getBook(signerAddress, tokenAddress);
        const token = new ethers.Contract(tokenAddress, DOXERC20.abi, signer);
        const tokenName: string = await token.name();
        const tokenSymbol: string = await token.symbol();
        const usedFaucet: boolean = await token.usedFaucet(signerAddress);
        const [, decimals] = await _tokenBalance(tokenAddress);
        const newTokenInfo = new TokenInfo(
          tokenAddress,
          tokenName,
          tokenSymbol,
          decimals,
          book,
          usedFaucet
        );

        // Don't add the token to the list if it already exists
        if (
          newTokensList.filter((t) => t.address === tokenAddress).length === 0
        ) {
          newTokensList.push(newTokenInfo);
        }
      }
      setTokens(newTokensList);
    } catch (error) {
      console.log(error);
    }
  }

  async function getAccounts() {
    if (typeof (window as any).ethereum !== "undefined") {
      setAccountsChecked(true);
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const signer = provider.getSigner();
      if (!signer) {
        return;
      }
      const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);

      try {
        var newAccountsList = [];
        const accountListLength: number = await dox.accountListLength();
        if (accountListLength > 0) {
          for (var i = 0; i < accountListLength; i++) {
            const address: string = await dox.getAccount(i);
            const accountInfo = new AccountInfo(address);
            // setAccounts((accounts) => [...accounts, accountInfo]);

            // Don't add the token to the list if it already exists
            if (
              newAccountsList.filter((a) => a.address === address).length === 0
            ) {
              newAccountsList.push(accountInfo);
            }
          }
          setAccounts(newAccountsList);
        }
      } catch (error) {
        console.log(error);
      }
    }
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
      provider={provider}
      walletAddress={walletAddress}
      addTransaction={addTransaction}
      updateData={updateData}
    />
  );
  switch (menuSelection) {
    case 1:
      content = (
        <Deposit
          provider={provider}
          walletAddress={walletAddress}
          addTransaction={addTransaction}
          tokens={tokens}
          getBooks={getBooks}
          updateData={updateData}
        />
      );
      break;
    case 2:
      content = (
        <Liquidity
          provider={provider}
          walletAddress={walletAddress}
          addTransaction={addTransaction}
          tokens={tokens}
          getBooks={getBooks}
          updateData={updateData}
        />
      );
      break;
    case 3:
      content = (
        <Swap
          provider={provider}
          walletAddress={walletAddress}
          addTransaction={addTransaction}
          tokens={tokens}
          getBooks={getBooks}
          updateData={updateData}
        />
      );
      break;
    case 4:
      content = (
        <Transfer
          provider={provider}
          walletAddress={walletAddress}
          addTransaction={addTransaction}
          tokens={tokens}
          accounts={accounts}
          getBooks={getBooks}
          updateData={updateData}
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
