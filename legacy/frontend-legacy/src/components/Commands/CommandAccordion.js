import * as React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionDetails from "@mui/material/AccordionDetails";
import AccordionSummary from "@mui/material/AccordionSummary";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

export default function CommandAccordion(props) {
  const [expanded, setExpanded] = React.useState(false);

  const handleChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  const { commands } = props;
  const accordion = [];

  for (let i = 0; i < commands.length; i++) {
    const isExpanded = expanded === `panel${i}`;
    let accordionSx = { borderLeft: 0, borderColor: "primary.main" };
    let summerySx = { color: "default" };
    if (isExpanded) {
      accordionSx.borderLeft = 2;
      summerySx.color = "primary.main";
    }

    accordion.push(
      <Accordion
        expanded={isExpanded}
        onChange={handleChange(`panel${i}`)}
        key={i.toString()}
        sx={accordionSx}
      >
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls={`panel${i}bh-content`}
          id={`panel${i}bh-header`}
          sx={summerySx}
        >
          {commands[i].summery}
        </AccordionSummary>
        <AccordionDetails sx={{ pb: 0 }}>
          {commands[i].details}
        </AccordionDetails>
      </Accordion>
    );
  }

  return <React.Fragment>{accordion}</React.Fragment>;
}
