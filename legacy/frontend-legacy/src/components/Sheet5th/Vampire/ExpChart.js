import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

function createData(trait, cost) {
  return { trait, cost };
}

const rows = [
  createData("Increase Attribute", "New Level x 5"),
  createData("Increase Skill", "New Level x 3"),
  createData("New Specialty", "3 per specialty"),
  createData("Clan Discipline", "New Level x 5"),
  createData("Other Discipline", "New Level x 7"),
  createData("Caitiff Discipline", "New Level x 6"),
  createData("Thin-Blood Formula", "Formula Level x 3"),
  createData("Advantage", "3 per dot"),
  createData("Blood Potency", "New Level x 10"),
];

export default function ExpChart() {
  return (
    <TableContainer
      component={Paper}
      sx={{ maxWidth: 350, borderRadius: "15px", marginBottom: 6 }}
    >
      <Table aria-label="simple table">
        <TableHead>
          <TableRow>
            <TableCell>Trait</TableCell>
            <TableCell align="left">Experiance Cost</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.trait}
              sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
            >
              <TableCell component="th" scope="row">
                {row.trait}
              </TableCell>
              <TableCell align="left">{row.cost}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
