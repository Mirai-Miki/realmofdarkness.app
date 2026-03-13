import { Grid2 } from "@mui/material";
import Skill from "./Skill";
import Header from "../Sheet/Header";
import { useSheetContext } from "../../routes/Character/Vampire5thSheet";

export default function SkillsTab(props) {
  const { sheet } = useSheetContext();
  const skills = sheet.skills;

  return (
    <Grid2 container spacing={2} marginBottom={4} size={12}>
      <Header>Skills</Header>
      <Grid2
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <Skill name="Athletics" skill={skills.athletics} />
        <Skill name="Brawl" skill={skills.brawl} />
        <Skill name="Craft" skill={skills.craft} />
        <Skill name="Drive" skill={skills.drive} />
        <Skill name="Firearms" skill={skills.firearms} />
        <Skill name="Larceny" skill={skills.larceny} />
        <Skill name="Melee" skill={skills.melee} />
        <Skill name="Stealth" skill={skills.stealth} />
        <Skill name="Survival" skill={skills.survival} />
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <Skill name="Animal Ken" skill={skills.animal_ken} />
        <Skill name="Etiquette" skill={skills.etiquette} />
        <Skill name="Insight" skill={skills.insight} />
        <Skill name="Intimidation" skill={skills.intimidation} />
        <Skill name="Leadership" skill={skills.leadership} />
        <Skill name="Performance" skill={skills.performance} />
        <Skill name="Persuasion" skill={skills.persuasion} />
        <Skill name="Streetwise" skill={skills.streetwise} />
        <Skill name="Subterfuge" skill={skills.subterfuge} />
      </Grid2>
      <Grid2
        size={{
          xs: 12,
          sm: 4,
        }}
      >
        <Skill name="Academics" skill={skills.academics} />
        <Skill name="Awareness" skill={skills.awareness} />
        <Skill name="Finance" skill={skills.finance} />
        <Skill name="Investigation" skill={skills.investigation} />
        <Skill name="Medicine" skill={skills.medicine} />
        <Skill name="Occult" skill={skills.occult} />
        <Skill name="Politics" skill={skills.politics} />
        <Skill name="Science" skill={skills.science} />
        <Skill name="Technology" skill={skills.technology} />
      </Grid2>
    </Grid2>
  );
}
