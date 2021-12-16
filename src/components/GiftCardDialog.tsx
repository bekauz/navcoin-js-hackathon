import * as React from "react";
import { DialogTitle, IconButton, Button, Dialog, DialogActions, DialogContent, Paper, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import QRCode from "qrcode.react";
import CopyToClipboard from "react-copy-to-clipboard";
import ContentCopyIcon from "@material-ui/icons/ContentCopy";


interface DialogTitleProps {
  id: string;
  children?: React.ReactNode;
  onClose: () => void;
}

const BootstrapDialogTitle = (props: DialogTitleProps) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme: any) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

export default function GiftCardDialog(props: any) {


  const { open, onClose, text } = props;

  const handleClose = onClose;

  return (
    <div>
      <Dialog
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
      >
        <BootstrapDialogTitle
          id="customized-dialog-title"
          onClose={handleClose}
        >
          Your gift code
        </BootstrapDialogTitle>
        <DialogContent
          sx={{
            alignSelf: "center",
            margin: "auto",
            width: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
          }}>
          <QRCode
            value={text}
            title={text}
            style={{
              width: 250,
              height: 250,
            }}
          ></QRCode>

          <Paper sx={{
            mx: 3,
            mt: 2,
            mb: 1,
            p: 2,
            position: "relative",
            wordBreak: "break-word",
            width: 250,
          }}
          >
            <CopyToClipboard text={text}>
              <IconButton sx={{ position: "absolute", bottom: 2, right: 2 }}>
                <ContentCopyIcon />
              </IconButton>
            </CopyToClipboard>
            <Typography gutterBottom>{text}</Typography>
          </Paper>

        </DialogContent>
      </Dialog>
    </div>
  );
}
