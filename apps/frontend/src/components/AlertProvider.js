import { AlertTitle, Snackbar, Alert } from "@mui/material";
import { createContext, useContext, useState } from "react";

import { getSerializerErrors } from "../utility";

const AlertContext = createContext(null);
export const useAlertContext = () => useContext(AlertContext);

export default function AlertProvider(props) {
  const { children } = props;
  const [open, setOpen] = useState(false);
  const [alert, setAlert] = useState({
    title: "",
    message: "",
    severity: "error",
  });

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpen(false);
  };

  function pushAlert({ title = "", message = "", severity = "error" } = {}) {
    if (typeof message === "object")
      // Serializer Errors
      message = getSerializerErrors(message);
    setAlert({ title, message, severity });
    setOpen(true);
  }

  return (
    <>
      <Snackbar
        open={open}
        autoHideDuration={10000}
        onClose={handleClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={alert.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          <AlertTitle>{alert?.title}</AlertTitle>
          {alert?.message}
        </Alert>
      </Snackbar>
      <AlertContext.Provider value={{ pushAlert }}>
        {children}
      </AlertContext.Provider>
    </>
  );
}
