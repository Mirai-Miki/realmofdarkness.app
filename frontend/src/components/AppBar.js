import * as React from "react";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Menu from "@mui/material/Menu";
import MenuIcon from "@mui/icons-material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { Link } from "react-router-dom";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { useClientContext } from "./ClientProvider";

let host;
if (process.env.NODE_ENV === "production")
  host = "https://realmofdarkness.app/";
else if (process.env.NODE_ENV === "preproduction")
  host = "https://dev.realmofdarkness.app/";
else host = "http://localhost:8080/";

const pages = {
  sm: ["20th Anniversary", "Chronicles of Darkness"],
  games: ["20th Anniversary", "Chronicles of Darkness"],
  user: [],
};
const routes = {
  "20th Anniversary": "20th/",
  "Chronicles of Darkness": "cod/",
  Characters: "characters/",
  Servers: "servers/",
};

export default function ResponsiveAppBar(props) {
  const { user } = useClientContext();
  const [scroll, setScroll] = React.useState(false);
  const [anchorElNav, setAnchorElNav] = React.useState(null);
  const [anchorElUser, setAnchorElUser] = React.useState(null);
  const [anchorElGames, setAnchorElGames] = React.useState(null);

  const handleOpenNavMenu = (event) => {
    setAnchorElNav(event.currentTarget);
  };
  const handleOpenUserMenu = (event) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleOpenGamesMenu = (event) => {
    setAnchorElGames(event.currentTarget);
  };

  const handleCloseNavMenu = () => {
    setAnchorElNav(null);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  const handleCloseGamesMenu = () => {
    setAnchorElGames(null);
  };

  const loginButton = (
    <Box sx={{ flexGrow: 0 }}>
      <Button color="primary" variant="contained" href={host + "auth/login/"}>
        Login
      </Button>
    </Box>
  );

  const mdLinks = (
    <Box
      sx={{
        gap: "10px",
        flexGrow: 1,
        display: { xs: "none", md: "flex" },
        height: 64,
      }}
    >
      <Button
        size="large"
        endIcon={<KeyboardArrowDownIcon />}
        onClick={handleOpenGamesMenu}
        onMouseOver={handleOpenGamesMenu}
      >
        Games
      </Button>
      <Menu
        id="menu-appbar"
        anchorEl={anchorElGames}
        anchorOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        keepMounted
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
        open={Boolean(anchorElGames)}
        onClose={handleCloseGamesMenu}
        MenuListProps={{ onMouseLeave: handleCloseGamesMenu }}
      >
        <MenuItem component="a" href="https://v5.realmofdarkness.app/">
          <Typography textAlign="center">5th Edition</Typography>
        </MenuItem>
        {pages.games.map((page) => (
          <MenuItem
            key={page}
            onClick={handleCloseGamesMenu}
            component={Link}
            to={routes[page]}
          >
            <Typography textAlign="center">{page}</Typography>
          </MenuItem>
        ))}
      </Menu>
      <Button size="large" href="https://discord.gg/p82yc8sKx2" target="_blank">
        Discord Server
      </Button>
      <Button
        size="large"
        href="https://www.patreon.com/MiraiMiki"
        target="_blank"
      >
        Patreon
      </Button>
    </Box>
  );

  function avatarMenu(user) {
    return (
      <Box sx={{ flexGrow: 0 }}>
        <Tooltip title="Open settings">
          <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
            <Avatar alt={user.username} src={user.avatar_url} />
          </IconButton>
        </Tooltip>
        <Menu
          sx={{ mt: "45px" }}
          id="menu-appbar"
          anchorEl={anchorElUser}
          anchorOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          keepMounted
          transformOrigin={{
            vertical: "top",
            horizontal: "right",
          }}
          open={Boolean(anchorElUser)}
          onClose={handleCloseUserMenu}
        >
          {pages.user.map((page) => (
            <MenuItem
              key={page}
              onClick={handleCloseUserMenu}
              component={Link}
              to={routes[page]}
            >
              <Typography textAlign="center">{page}</Typography>
            </MenuItem>
          ))}
          <MenuItem
            onClick={handleCloseUserMenu}
            component="a"
            href={host + "auth/logout/"}
          >
            <Typography textAlign="center">Logout</Typography>
          </MenuItem>
        </Menu>
      </Box>
    );
  }

  const trigger = useScrollTrigger({
    disableHysteresis: true,
    threshold: 0,
  });

  if (scroll && !trigger) {
    setScroll(false);
  } else if (!scroll && trigger) {
    setScroll(true);
  }

  return (
    <AppBar>
      <Container maxWidth="xl">
        <Toolbar disableGutters>
          <Link to="/">
            <Box
              component="img"
              alt="Realm of Darkness Logo"
              loading="lazy"
              src="https://res.cloudinary.com/dze64d7cr/image/upload/v1701412692/Logo/banner_navbar_pc.webp"
              sx={{
                display: { xs: "none", md: "flex" },
                mr: 1,
                height: "45px",
                width: "158px",
              }}
            />
          </Link>

          <Box sx={{ flexGrow: 1, display: { xs: "flex", md: "none" } }}>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleOpenNavMenu}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorElNav}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "left",
              }}
              open={Boolean(anchorElNav)}
              onClose={handleCloseNavMenu}
              sx={{
                display: { xs: "block", md: "none" },
              }}
            >
              <MenuItem component="a" href="https://v5.realmofdarkness.app/">
                <Typography textAlign="center">5th Edition</Typography>
              </MenuItem>
              {pages.sm.map((page) => (
                <MenuItem
                  key={page}
                  onClick={handleCloseNavMenu}
                  component={Link}
                  to={routes[page]}
                >
                  <Typography textAlign="center">{page}</Typography>
                </MenuItem>
              ))}
              <MenuItem
                onClick={handleCloseNavMenu}
                component="a"
                href="https://discord.gg/p82yc8sKx2"
                target="_blank"
              >
                <Typography textAlign="center">Discord Server</Typography>
              </MenuItem>
              <MenuItem
                onClick={handleCloseNavMenu}
                component="a"
                href="https://www.patreon.com/MiraiMiki"
                target="_blank"
              >
                <Typography textAlign="center">Patreon</Typography>
              </MenuItem>
            </Menu>
          </Box>
          <Link to="/">
            <Box
              component="img"
              alt="Realm of Darkness Logo"
              loading="lazy"
              src="https://res.cloudinary.com/dze64d7cr/image/upload/v1701413470/Logo/banner_mobile.webp"
              sx={{
                display: { xs: "flex", md: "none" },
                flexGrow: 1,
                height: "42px",
                width: "116px",
              }}
            />
          </Link>
          <Typography
            sx={{
              display: { xs: "flex", md: "none" },
              flexGrow: 1,
            }}
          ></Typography>
          {mdLinks}
          {user ? avatarMenu(user) : loginButton}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
