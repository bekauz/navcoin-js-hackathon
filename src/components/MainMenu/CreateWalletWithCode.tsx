import { Box, Stack, TextField, Divider, Select, Typography, MenuItem, Button } from "@material-ui/core";
import React from "react";
import Default from "../../themes/Default";
import CreateWallet from "./CreateWallet";

class CreateWalletWithCode extends CreateWallet {

    constructor(props: any) {
        super(props);
    
        this.state = {
          ...props,
          name: "",
          errorName: false,
          password: undefined,
          spendingPassword: undefined,
          network: "mainnet",
          giftCode: "",
        };
      }
    
  public render() {

    const {
        wallets,
        name,
        errorName,
        onClick,
        password,
        spendingPassword,
        network,
        giftCode,
    } = this.state;

    return (
      <React.Fragment>
        <Box
          sx={{
            m: (theme) => theme.spacing(0, 1, 1, 1),
          }}
        >
          <Stack spacing={2}>
            <TextField
              id="name"
              label="Name"
              placeholder="Wallet 1"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              error={errorName}
              onChange={(e) => {
                if (wallets.indexOf(e.target.value) < 0) {
                  this.setState({ name: e.target.value, errorName: false });
                } else {
                  this.setState({ errorName: true });
                }
              }}
            />

            <Divider light>Encryption settings (Recommended)</Divider>

            <TextField
              id="password"
              label="Wallet password"
              placeholder="The password used to open the wallet"
              fullWidth
              type={"password"}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => {
                this.setState({ password: e.target.value });
              }}
            />

            <TextField
              id="spendingPassword"
              label="Spending password"
              placeholder="The password used to send transactions"
              fullWidth
              type={"password"}
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => {
                this.setState({ spendingPassword: e.target.value });
              }}
            />

            <Divider light>Network</Divider>

            <Select
              id="network"
              value={network}
              fullWidth
              onChange={(e) => {
                this.setState({ network: e.target.value });
              }}
              error={!this.getNetworkName(network)}
              displayEmpty
              renderValue={(value: any) => {
                return <Typography>{this.getNetworkName(value)}</Typography>;
              }}
            >
              {this.networks.map((result) => {
                return (
                  <MenuItem key={result[0]} value={result[0]}>
                    {result[1]}
                  </MenuItem>
                );
              })}
            </Select>

            <Divider light>Gift Code</Divider>

            <TextField
              id="giftCode"
              label="Gift code"
              placeholder="Enter your gift code to redeem"
              fullWidth
              InputLabelProps={{
                shrink: true,
              }}
              onChange={(e) => {
                this.setState({ giftCode: e.target.value });
              }}
            />

          </Stack>
        </Box>
        <Box
          sx={{
            m: (theme) => theme.spacing(2, 1, 1, 1),
          }}
        >
          <Button
            sx={{ width: "auto", float: "right" }}
            onClick={() => {
              if (!errorName) {
                onClick(
                  name,
                  undefined,
                  undefined,
                  password,
                  spendingPassword,
                  false,
                  network,
                  giftCode
                );
              }
            }}
          >
            Create
          </Button>
        </Box>
      </React.Fragment>
    );
  }


}

export default CreateWalletWithCode;