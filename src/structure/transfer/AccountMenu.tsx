import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import InputLabel from "@material-ui/core/InputLabel";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import "./AccountMenu.css";

import { AccountInfo } from "../../App";

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
  accounts: AccountInfo[];
  accountSelect: (selected: string) => void;
}

const AccountMenu: React.FC<AccountMenuProps> = ({
  label,
  accounts,
  accountSelect,
}) => {
  const classes = useStyles();
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
