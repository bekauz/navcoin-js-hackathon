import {
  Box,
  Button,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  TextField,
  Typography,
} from "@material-ui/core";
import React from "react";


export default function Gift(props: any): React.ReactElement {
  const {
    wallet,
    network,
    balance,
    hideTitle,
    hideFrom,
    utxoType,
    onGift,
  } = props;

  const [from, setFrom] = React.useState(utxoType == 0x2 ? "staked" : "nav");
  if (!balance || !balance[from]) return <>Loading</>;
  const [available, setAvailable] = React.useState(
    balance[from].confirmed / 1e8
  );

  const [amount, setAmount] = React.useState<number | undefined>(undefined);
  const [errorAmount, setErrorAmount] = React.useState(false);

  return (
    <Box
    sx={{
      display: "flex",
      width: "100%",
      height: "100%",
      flexDirection: "column",
    }}
  >
    <Box
      sx={{
        display: "flex",
        width: "100%",
        flexDirection: "column",
      }}
    >
      {hideTitle ? (
        <></>
      ) : (
        <Typography
          sx={{
            m: 4,
            mb: 2,
            maxWidth: "100%",
            wordWrap: "break-word",
            textAlign: "center",
          }}
          variant={"h4"}
        >
          Generate new gift
        </Typography>
      )}
      <Box
        sx={{
          maxWidth: 800,
          width: "90%",
          borderRadius: 1,
          mt: 2,

          p: 2,
          pt: 4,
          alignSelf: "center",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: "background.paper",
        }}
      >
        <Box
          sx={{
            m: (theme) => theme.spacing(0, 1, 1, 1),
          }}
        >
          <Stack spacing={2}>
            {hideFrom ? (
              <></>
            ) : (
              <FormControl>
                <InputLabel id="network-label">From</InputLabel>

                <Select
                  labelId={"network-label"}
                  id="network"
                  value={from}
                  fullWidth
                  input={<OutlinedInput label="From" />}
                  onChange={(e) => {
                    if (e.target.value == "nav") {
                      if (amount == balance.xnav.confirmed / 1e8)
                        setAmount(balance.nav.confirmed / 1e8);
                      setAvailable(balance.nav.confirmed / 1e8);
                    } else if (e.target.value == "xnav") {
                      if (amount == balance.nav.confirmed / 1e8)
                        setAmount(balance.xnav.confirmed / 1e8);
                      setAvailable(balance.xnav.confirmed / 1e8);
                    }
                    setFrom(e.target.value);
                  }}
                  displayEmpty
                >
                  <MenuItem key="nav" value="nav">
                    NAV ({balance.nav.confirmed / 1e8} available)
                  </MenuItem>
                  <MenuItem key="xnav" value="xnav">
                    xNAV ({balance.xnav.confirmed / 1e8} available)
                  </MenuItem>
                </Select>
              </FormControl>
            )}
            <TextField
              autoComplete="off"
              id="amount"
              label="Amount"
              placeholder="The amount to gift"
              fullWidth
              error={errorAmount}
              InputLabelProps={{
                shrink: true,
              }}
              value={amount}
              onChange={(e) => {
                const am = parseFloat(e.target.value);
                if (am > 0 && am <= available) {
                  setAmount(am);
                  setErrorAmount(false);
                } else {
                  setErrorAmount(true);
                }
              }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Typography
                      onClick={() => {
                        setAmount(available);
                      }}
                    >
                      MAX
                    </Typography>
                  </InputAdornment>
                ),
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
            onClick={async () => {
              if (amount && amount > 0) {
                await onGift();
              }
            }}
          >
            Generate voucher
          </Button>
        </Box>
      </Box>
    </Box>
  </Box>
  );
}