import {
  Box,
  Typography,
} from "@material-ui/core";
import React from "react";


export default function Gift(props: any): React.ReactElement {
  const {
    wallet,
    network,
    balance,
    hideTitle,
  } = props;


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
      </Box>
    </Box>
  );
}