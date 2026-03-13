import {
  Card,
  CardHeader,
  CardActions,
  Typography,
  Divider,
  Avatar,
  Grid2,
} from "@mui/material";
import Vampire5thInfo from "./Vampire5thInfo";
import Hunter5thInfo from "./Hunter5thInfo";
import Mortal5thInfo from "./Mortal5thInfo";
import Vampire20thInfo from "./Vampire20thInfo";
import Human20thInfo from "./Human20thInfo";
import Werewolf20thInfo from "./Werewolf20thInfo";
import Ghoul20thInfo from "./Ghoul20thInfo";
import Changeling20thInfo from "./Changeling20thInfo";
import Wraith20thInfo from "./Wraith20thInfo";
import Demon20thInfo from "./Demon20thInfo";
import Mage20thInfo from "./Mage20thInfo";
import { useClientContext } from "../ClientProvider";
import { useTheme } from "@mui/material/styles";

import DeleteCharacterButton from "../Sheet/DeleteCharacterButton";
import Werewolf5thInfo from "./Werewolf5thInfo";

const cardInfo = {
  vampire5th: Vampire5thInfo,
  hunter5th: Hunter5thInfo,
  werewolf5th: Werewolf5thInfo,
  human5th: Mortal5thInfo,
  ghoul5th: Mortal5thInfo,
  vampire20th: Vampire20thInfo,
  human20th: Human20thInfo,
  werewolf20th: Werewolf20thInfo,
  ghoul20th: Ghoul20thInfo,
  changeling20th: Changeling20thInfo,
  wraith20th: Wraith20thInfo,
  demon20th: Demon20thInfo,
  mage20th: Mage20thInfo,
};

export default function CharacterCard(props) {
  const { character } = props;
  const { user, members, chronicles } = useClientContext();
  const theme = useTheme();
  const CardInfo = cardInfo[character.splat];
  if (!CardInfo) return null;

  let avatar = user.avatar_url;
  let nickname = user.username;
  if (character.chronicle && members[character.chronicle][character.user]) {
    const member = members[character.chronicle][character.user];
    avatar = member?.avatar_url || avatar;
    nickname = member?.nickname || nickname;
  }

  const sx = { minWidth: "270px", maxWidth: "325px" };
  if (character.is_sheet)
    sx.borderLeft = `1px solid ${theme.palette.primary.main}`;

  return (
    <Grid2>
      <Card sx={sx}>
        <CardHeader
          avatar={<Avatar alt={nickname} src={avatar} />}
          title={<Typography color="primary">{character.name}</Typography>}
          subheader={nickname}
        />
        <Divider />
        <CardInfo
          character={character}
          chronicle={chronicles[character.chronicle]}
          user={user}
        />
        <Divider />
        <CardActions sx={{ padding: "8px" }}>
          {" "}
          {/* Changed from padding: 0 */}
          <DeleteCharacterButton characterId={character.id} button />
        </CardActions>
      </Card>
    </Grid2>
  );
}
