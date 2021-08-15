import React, { useState } from "react";
import { ethers } from "ethers";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
// import Button from "@material-ui/core/Button";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import "./AccountMenu.css";

import { doxAddress } from "../../App";
// import DOXERC20 from "../../contracts/DOXERC20.sol/DOXERC20.json";
import ParadoxV1 from "../../contracts/ParadoxV1.sol/ParadoxV1.json";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      "& > *": {
        margin: theme.spacing(1),
        // marginLeft: 10,
        width: 276,
        // fontSize: 20,
        // fontFamily: "Ubuntu";
      },
    },
    formControl: {
      margin: theme.spacing(1),
      minWidth: 276,
      maxWidth: 276,
      overflow: "hidden",
    },
    selectEmpty: {
      marginTop: theme.spacing(2),
    },
  })
);

/*
INTERFACES
*/
interface AccountMenuProps {
  label: string;
  accountSelect: (selected: string) => void;
}

/*
CLASSES
*/
export class AccountInfo {
  constructor(
    public address: string // public name: string, // public balance: ethers.BigNumber
  ) {}
}

const AccountMenu: React.FC<AccountMenuProps> = ({ label, accountSelect }) => {
  const classes = useStyles();
  const [accountsCalled, setAccountsCalled] = useState(false);
  const [accounts, setAccounts] = useState<AccountInfo[]>([]);
  // const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [accountSelected, setAccountSelected] = useState("");

  const handleClose = () => {
    // setAnchorEl(null);
  };

  const handleSelect = (account: string) => {
    handleClose();
    setAccountSelected(account);
    accountSelect(account);
    // console.log(account);
  };

  // request access to the user's MetaMask account
  async function requestAccount() {
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
  }

  async function accountList() {
    if (typeof (window as any).ethereum !== "undefined") {
      setAccountsCalled(true);
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      const signer = provider.getSigner();
      if (!signer) {
        return;
      }
      const dox = new ethers.Contract(doxAddress, ParadoxV1.abi, signer);

      try {
        const accountListLength: number = await dox.accountListLength();
        if (accountListLength > 0) {
          for (var i = 0; i < accountListLength; i++) {
            const address: string = await dox.getAccount(i);

            const accountInfo = new AccountInfo(address);
            setAccounts((accounts) => [...accounts, accountInfo]);
          }
        }
      } catch (error) {
        console.log(error);
      }
    }
  }

  // DO ON LOAD
  if (!accountsCalled) {
    accountList();
  }

  return (
    <div>
      <div id="form-left">
        <FormControl variant="filled" className={classes.formControl}>
          <InputLabel id="account-select-1">{accountSelected}</InputLabel>
          <Select
            labelId="account-select-1-label"
            id="account-select-1-select"
            value={""}
            onChange={handleClose}
            // native
            // inputProps={{ style: { width: 240, textOverflow: "ellipsis" } }}
          >
            {accounts.map((account) => (
              <MenuItem
                // hover={false}
                key={account.address}
                onClick={() => handleSelect(account.address)}
                style={{
                  width: "300px",
                  textOverflow: "ellipsis",
                }}
              >
                {account.address}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
    </div>
  );
};
export default AccountMenu;
