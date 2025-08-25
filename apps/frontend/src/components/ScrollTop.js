import Box from "@mui/material/Box";
import Zoom from "@mui/material/Zoom";
import useScrollTrigger from "@mui/material/useScrollTrigger";

export default function ScrollTop(props) {
  const { children } = props;

  const handleClick = () => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  return (
    <Zoom
      in={useScrollTrigger({
        disableHysteresis: true,
        threshold: 50,
      })}
    >
      <Box
        onClick={handleClick}
        role="presentation"
        sx={{ position: "fixed", bottom: 16, right: 16 }}
      >
        {children}
      </Box>
    </Zoom>
  );
}
