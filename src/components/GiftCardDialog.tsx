import * as React from "react";
import { DialogTitle, IconButton, Button, Dialog, DialogActions, DialogContent, Paper, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";


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
           {text}
          </Dialog>
        </div>
      );
}
