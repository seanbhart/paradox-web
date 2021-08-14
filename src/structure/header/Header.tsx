import React, { useState } from "react";
import { createStyles, makeStyles, Theme } from "@material-ui/core/styles";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import Menu from "@material-ui/core/Menu";
import MenuIcon from "@material-ui/icons/Menu";
import MenuItem from "@material-ui/core/MenuItem";

import { ethers } from "ethers";
import { colors } from "../../common/Formatting";
import "./Header.css";

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    menuButton: {
      marginRight: theme.spacing(2),
    },
    title: {
      flexGrow: 1,
      fontSize: 20,
      fontFamily: "Ubuntu",
      marginLeft: 240,
    },
  })
);

interface MenuProps {
  setMenuSelect: (selected: number) => void;
  setProvdr: (provider: ethers.providers.Web3Provider) => void;
  setWalletAddr: (address: string) => void;
}

/*
DEFAULT FUNCTION
*/
const Header: React.FC<MenuProps> = ({
  setMenuSelect,
  setProvdr,
  setWalletAddr,
}) => {
  const classes = useStyles();
  // const [user] = useAuthState(firebaseAppAuth);
  // const [tokens, setTokens] = useState<TokenInfo[]>([]);
  // const [walletAddress, setWalletAddress] = useState("");
  const [networkName, setNetworkName] = useState("");
  const [walletText, setWalletText] = useState("Connect Wallet");

  const [menuSelection, setMenuSelection] = useState<number>(0);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = (selection: number) => {
    setAnchorEl(null);
    setMenuSelection(selection);
    setMenuSelect(selection);
  };

  // request access to the user's MetaMask account
  async function requestAccount() {
    await (window as any).ethereum.request({ method: "eth_requestAccounts" });
  }

  async function connect() {
    if (typeof (window as any).ethereum !== "undefined") {
      await requestAccount();
      const provider = new ethers.providers.Web3Provider(
        (window as any).ethereum
      );
      setProvdr(provider);
      const network = await provider.getNetwork();
      setNetworkName(network.name);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      setWalletAddr(address);
      setWalletText(address.slice(0, 20));
    }
  }

  var menuHeader = (
    <Typography variant="h6" className={classes.title}>
      L1: Tokens
    </Typography>
  );
  switch (menuSelection) {
    case 1:
      menuHeader = (
        <Typography variant="h6" className={classes.title}>
          L0: Deposit
        </Typography>
      );
      break;
    case 2:
      menuHeader = (
        <Typography variant="h6" className={classes.title}>
          L0: Liquidity
        </Typography>
      );
      break;
    case 3:
      menuHeader = (
        <Typography variant="h6" className={classes.title}>
          L0: Swap
        </Typography>
      );
      break;
    default:
      break;
  }

  return (
    <div className={classes.root}>
      <AppBar position="fixed" style={{ background: "#000" }}>
        <Toolbar>
          <IconButton
            edge="start"
            className={classes.menuButton}
            color="inherit"
            aria-label="menu"
            aria-haspopup="true"
            aria-controls="simple-menu"
            onClick={handleClick}
          >
            <MenuIcon />
          </IconButton>

          <Menu
            id="simple-menu"
            anchorEl={anchorEl}
            keepMounted
            open={Boolean(anchorEl)}
            onClose={() => handleClose(0)}
          >
            <MenuItem onClick={() => handleClose(0)}>L1: Tokens</MenuItem>
            <MenuItem onClick={() => handleClose(1)}>L0: Deposit</MenuItem>
            <MenuItem onClick={() => handleClose(2)}>L0: Liquidity</MenuItem>
            <MenuItem onClick={() => handleClose(3)}>L0: Swap</MenuItem>
          </Menu>
          {menuHeader}
          {/* <Button color="inherit">Login</Button> */}
          <div id="network-name">{networkName}</div>
          <div
            id="connect"
            onClick={connect}
            style={{
              backgroundColor: colors.background,
            }}
          >
            {walletText}
          </div>
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default Header;
