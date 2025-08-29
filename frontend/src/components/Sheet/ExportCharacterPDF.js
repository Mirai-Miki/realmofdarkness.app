import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { Tooltip, IconButton } from "@mui/material";
import jsPDF from "jspdf";

export default function ExportCharacterPDF(props) {
  const { sheet } = props;

  function generateV5PDF() {
    const pdf = new jsPDF("p", "mm", "a4");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;

    let yPosition = margin;
    const lineHeight = 6;
    const sectionSpacing = 15;

    // Simple and safe colors
    const colors = {
      primary: [0.2, 0, 0], // Dark red
      text: [0, 0, 0], // Pure black
      border: [0.3, 0, 0], // Red for borders
    };

    // Function to draw a simple box with title
    function drawSimpleBox(title, startY, endY) {
      const boxMargin = 3;
      const titleHeight = 8;
      const boxStartY = startY - titleHeight - boxMargin;
      const boxEndY = endY + boxMargin;

      // Border only, no background - with thinner lines
      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.2);
      pdf.rect(
        margin - boxMargin,
        boxStartY,
        contentWidth + 2 * boxMargin,
        boxEndY - boxStartY
      );

      // Simple title
      pdf.setFont("helvetica", "bold");
      pdf.setTextColor(...colors.primary);
      pdf.setFontSize(11);
      pdf.text(title, margin, boxStartY + 6);

      // Restore colors
      pdf.setTextColor(...colors.text);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(10);

      return boxEndY;
    }

    // Function to handle long text
    function addWrappedText(text, x, y, maxWidth) {
      const words = text.split(" ");
      let line = "";
      let currentY = y;
      let linesAdded = 0;

      for (let i = 0; i < words.length; i++) {
        const testLine = line + words[i] + " ";
        const testWidth = pdf.getTextWidth(testLine);

        if (testWidth > maxWidth && line !== "") {
          pdf.text(line.trim(), x, currentY);
          line = words[i] + " ";
          currentY += lineHeight;
          linesAdded++;
        } else {
          line = testLine;
        }
      }

      if (line) {
        pdf.text(line.trim(), x, currentY);
        linesAdded++;
      }

      return linesAdded * lineHeight;
    }

    // Simple function to draw dots
    function drawSimpleDots(value, x, y, maxDots = 5) {
      const dotRadius = 1;
      const dotSpacing = 4;

      for (let i = 0; i < maxDots; i++) {
        const dotX = x + i * dotSpacing;

        if (i < value) {
          // Filled dot
          pdf.setFillColor(...colors.primary);
          pdf.circle(dotX, y, dotRadius, "F");
        } else {
          // Empty dot
          pdf.setDrawColor(...colors.border);
          pdf.circle(dotX, y, dotRadius, "S");
        }
      }
    }

    // Simple main title
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(24);
    pdf.setTextColor(...colors.primary);
    pdf.text("VAMPIRE", pageWidth / 2, yPosition, { align: "center" });
    yPosition += lineHeight * 2;
    pdf.setFontSize(16);
    pdf.text("THE MASQUERADE 5th EDITION", pageWidth / 2, yPosition, {
      align: "center",
    });
    yPosition += lineHeight * 3;

    // General information
    let sectionStart = yPosition;
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(10);

    // First column
    pdf.text("Name:", margin, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(sheet.name || "", margin + 25, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Chronicle:", margin, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(sheet.chronicle || "", margin + 25, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Clan:", margin, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(sheet.clan || "", margin + 25, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Blood Potency:", margin, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(sheet.blood_potency || 0), margin + 35, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Generation:", margin, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(sheet.generation || 0), margin + 35, yPosition);
    yPosition += lineHeight * 1.5;

    // Second column
    const col2X = pageWidth / 2;
    yPosition = sectionStart;

    pdf.setFont("helvetica", "bold");
    pdf.text("Ambition:", col2X, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(sheet.ambition || "", col2X + 25, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Desire:", col2X, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(sheet.desire || "", col2X + 25, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Predator Type:", col2X, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(sheet.predator_type || "", col2X + 25, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Hunger:", col2X, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(sheet.hunger || 0), col2X + 35, yPosition);
    yPosition += lineHeight * 1.5;

    pdf.setFont("helvetica", "bold");
    pdf.text("Humanity:", col2X, yPosition);
    pdf.setFont("helvetica", "normal");
    pdf.text(String(sheet.humanity || 0), col2X + 35, yPosition);
    yPosition += lineHeight * 2;

    drawSimpleBox(
      "CHARACTER INFORMATION",
      sectionStart - lineHeight,
      yPosition
    );
    yPosition += sectionSpacing * 2;

    // Attributes
    sectionStart = yPosition;
    pdf.setFont("helvetica", "bold");

    // Physical
    const physicalX = margin + 10;
    pdf.text("Physical", physicalX, yPosition);
    yPosition += lineHeight * 1.5;

    const attributes = [
      { name: "Strength", value: sheet.attributes?.strength || 0 },
      { name: "Dexterity", value: sheet.attributes?.dexterity || 0 },
      { name: "Stamina", value: sheet.attributes?.stamina || 0 },
    ];

    attributes.forEach((attr) => {
      pdf.setFont("helvetica", "normal");
      pdf.text(attr.name, physicalX, yPosition);
      drawSimpleDots(attr.value, physicalX + 30, yPosition - 1.5);
      yPosition += lineHeight;
    });

    // Social
    yPosition = sectionStart;
    const socialX = margin + contentWidth / 3 + 5;
    pdf.setFont("helvetica", "bold");
    pdf.text("Social", socialX, yPosition);
    yPosition += lineHeight * 1.5;

    const socialAttributes = [
      { name: "Charisma", value: sheet.attributes?.charisma || 0 },
      { name: "Manipulation", value: sheet.attributes?.manipulation || 0 },
      { name: "Composure", value: sheet.attributes?.composure || 0 },
    ];

    socialAttributes.forEach((attr) => {
      pdf.setFont("helvetica", "normal");
      pdf.text(attr.name, socialX, yPosition);
      drawSimpleDots(attr.value, socialX + 30, yPosition - 1.5);
      yPosition += lineHeight;
    });

    // Mental
    yPosition = sectionStart;
    const mentalX = margin + (2 * contentWidth) / 3;
    pdf.setFont("helvetica", "bold");
    pdf.text("Mental", mentalX, yPosition);
    yPosition += lineHeight * 1.5;

    const mentalAttributes = [
      { name: "Intelligence", value: sheet.attributes?.intelligence || 0 },
      { name: "Wits", value: sheet.attributes?.wits || 0 },
      { name: "Resolve", value: sheet.attributes?.resolve || 0 },
    ];

    mentalAttributes.forEach((attr) => {
      pdf.setFont("helvetica", "normal");
      pdf.text(attr.name, mentalX, yPosition);
      drawSimpleDots(attr.value, mentalX + 30, yPosition - 1.5);
      yPosition += lineHeight;
    });

    const attrEndY = sectionStart + lineHeight * 5;
    drawSimpleBox("ATTRIBUTES", sectionStart - lineHeight, attrEndY);
    yPosition = attrEndY + sectionSpacing * 2;

    // Skills
    sectionStart = yPosition;

    // Physical Skills
    yPosition += lineHeight * 1.5;

    const physicalSkills = [
      { name: "Athletics", value: sheet.skills?.athletics?.value || 0 },
      { name: "Brawl", value: sheet.skills?.brawl?.value || 0 },
      { name: "Craft", value: sheet.skills?.craft?.value || 0 },
      { name: "Drive", value: sheet.skills?.drive?.value || 0 },
      { name: "Firearms", value: sheet.skills?.firearms?.value || 0 },
      { name: "Melee", value: sheet.skills?.melee?.value || 0 },
      { name: "Larceny", value: sheet.skills?.larceny?.value || 0 },
      { name: "Stealth", value: sheet.skills?.stealth?.value || 0 },
      { name: "Survival", value: sheet.skills?.survival?.value || 0 },
    ];

    physicalSkills.forEach((skill) => {
      pdf.setFont("helvetica", "normal");
      pdf.text(skill.name, physicalX, yPosition);
      drawSimpleDots(skill.value, physicalX + 30, yPosition - 1.5);
      yPosition += lineHeight;
    });

    // Social Skills
    yPosition = sectionStart;
    yPosition += lineHeight * 1.5;

    const socialSkills = [
      { name: "Animal Ken", value: sheet.skills?.animal_ken?.value || 0 },
      { name: "Etiquette", value: sheet.skills?.etiquette?.value || 0 },
      { name: "Insight", value: sheet.skills?.insight?.value || 0 },
      { name: "Intimidation", value: sheet.skills?.intimidation?.value || 0 },
      { name: "Leadership", value: sheet.skills?.leadership?.value || 0 },
      { name: "Performance", value: sheet.skills?.performance?.value || 0 },
      { name: "Persuasion", value: sheet.skills?.persuasion?.value || 0 },
      { name: "Streetwise", value: sheet.skills?.streetwise?.value || 0 },
      { name: "Subterfuge", value: sheet.skills?.subterfuge?.value || 0 },
    ];

    socialSkills.forEach((skill) => {
      pdf.setFont("helvetica", "normal");
      pdf.text(skill.name, socialX, yPosition);
      drawSimpleDots(skill.value, socialX + 30, yPosition - 1.5);
      yPosition += lineHeight;
    });

    // Mental Skills
    yPosition = sectionStart;
    yPosition += lineHeight * 1.5;

    const mentalSkills = [
      { name: "Academics", value: sheet.skills?.academics?.value || 0 },
      { name: "Awareness", value: sheet.skills?.awareness?.value || 0 },
      { name: "Finance", value: sheet.skills?.finance?.value || 0 },
      { name: "Investigation", value: sheet.skills?.investigation?.value || 0 },
      { name: "Medicine", value: sheet.skills?.medicine?.value || 0 },
      { name: "Occult", value: sheet.skills?.occult?.value || 0 },
      { name: "Politics", value: sheet.skills?.politics?.value || 0 },
      { name: "Science", value: sheet.skills?.science?.value || 0 },
      { name: "Technology", value: sheet.skills?.technology?.value || 0 },
    ];

    mentalSkills.forEach((skill) => {
      pdf.setFont("helvetica", "normal");
      pdf.text(skill.name, mentalX, yPosition);
      drawSimpleDots(skill.value, mentalX + 30, yPosition - 1.5);
      yPosition += lineHeight;
    });

    const skillsEndY = sectionStart + lineHeight * 11;
    drawSimpleBox("SKILLS", sectionStart - lineHeight, skillsEndY);
    yPosition = skillsEndY + sectionSpacing * 2;

    // New page for the rest of the content
    pdf.addPage();
    yPosition = margin;

    // Disciplines
    sectionStart = yPosition;
    pdf.setFont("helvetica", "bold");

    if (sheet.disciplines && Object.keys(sheet.disciplines).length > 0) {
      Object.entries(sheet.disciplines).forEach(
        ([discipline, disciplineData]) => {
          // Handle both object format {value: X} and direct number format
          const level =
            typeof disciplineData === "object"
              ? disciplineData.value || 0
              : disciplineData || 0;

          if (level > 0) {
            pdf.setFont("helvetica", "normal");
            pdf.text(discipline, margin + 10, yPosition);
            drawSimpleDots(level, margin + 50, yPosition - 1.5, 5);
            yPosition += lineHeight;
          }
        }
      );
    } else {
      // If no disciplines, add a placeholder
      pdf.setFont("helvetica", "normal");
      pdf.text("No disciplines", margin + 10, yPosition);
      yPosition += lineHeight;
    }

    drawSimpleBox("DISCIPLINES", sectionStart - lineHeight, yPosition);
    yPosition += sectionSpacing * 2;

    // Advantages
    sectionStart = yPosition;

    function addAdvantageSection(title, items, startY) {
      if (!items || items.length === 0) return startY;

      pdf.setFont("helvetica", "bold");
      pdf.text(title, margin + 10, startY);
      let currentY = startY + lineHeight * 1.5;

      items.forEach((item) => {
        if (item.name) {
          pdf.setFont("helvetica", "normal");
          pdf.text(item.name, margin + 15, currentY);
          drawSimpleDots(
            item.rating || item.level || 0,
            margin + 70,
            currentY - 1.5
          );
          currentY += lineHeight;

          if (item.description) {
            const heightUsed = addWrappedText(
              item.description,
              margin + 20,
              currentY,
              contentWidth - 40
            );
            currentY += heightUsed;
          }

          if (item.notes) {
            pdf.setFont("helvetica", "italic");
            const heightUsed = addWrappedText(
              item.notes,
              margin + 20,
              currentY,
              contentWidth - 40
            );
            currentY += heightUsed;
          }
          currentY += lineHeight / 2;
        }
      });

      return currentY;
    }

    let advantagesY = yPosition;
    advantagesY = addAdvantageSection("Merits", sheet.merits, advantagesY);
    advantagesY = addAdvantageSection("Flaws", sheet.flaws, advantagesY);
    advantagesY = addAdvantageSection(
      "Backgrounds",
      sheet.backgrounds,
      advantagesY
    );

    drawSimpleBox("ADVANTAGES", sectionStart - lineHeight, advantagesY);
    yPosition = advantagesY + sectionSpacing * 2;

    // Beliefs and Touchstones
    if (sheet.tenets || sheet.touchstones || sheet.convictions) {
      sectionStart = yPosition;

      if (sheet.tenets) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Tenets", margin + 10, yPosition);
        yPosition += lineHeight * 1.5;

        if (Array.isArray(sheet.tenets)) {
          sheet.tenets.forEach((tenet, index) => {
            if (tenet && tenet.trim()) {
              pdf.setFont("helvetica", "normal");
              const heightUsed = addWrappedText(
                `${index + 1}. ${tenet}`,
                margin + 15,
                yPosition,
                contentWidth - 30
              );
              yPosition += heightUsed + lineHeight / 2;
            }
          });
        } else {
          pdf.setFont("helvetica", "normal");
          const heightUsed = addWrappedText(
            sheet.tenets,
            margin + 15,
            yPosition,
            contentWidth - 30
          );
          yPosition += heightUsed + lineHeight;
        }
      }

      if (sheet.touchstones) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Touchstones", margin + 10, yPosition);
        yPosition += lineHeight * 1.5;

        if (Array.isArray(sheet.touchstones)) {
          sheet.touchstones.forEach((touchstone, index) => {
            if (touchstone && touchstone.trim()) {
              pdf.setFont("helvetica", "normal");
              const heightUsed = addWrappedText(
                `${index + 1}. ${touchstone}`,
                margin + 15,
                yPosition,
                contentWidth - 30
              );
              yPosition += heightUsed + lineHeight / 2;
            }
          });
        } else {
          pdf.setFont("helvetica", "normal");
          const heightUsed = addWrappedText(
            sheet.touchstones,
            margin + 15,
            yPosition,
            contentWidth - 30
          );
          yPosition += heightUsed + lineHeight;
        }
      }

      if (sheet.convictions) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Convictions", margin + 10, yPosition);
        yPosition += lineHeight * 1.5;

        if (Array.isArray(sheet.convictions)) {
          sheet.convictions.forEach((conviction, index) => {
            if (conviction && conviction.trim()) {
              pdf.setFont("helvetica", "normal");
              const heightUsed = addWrappedText(
                `${index + 1}. ${conviction}`,
                margin + 15,
                yPosition,
                contentWidth - 30
              );
              yPosition += heightUsed + lineHeight / 2;
            }
          });
        } else {
          pdf.setFont("helvetica", "normal");
          const heightUsed = addWrappedText(
            sheet.convictions,
            margin + 15,
            yPosition,
            contentWidth - 30
          );
          yPosition += heightUsed + lineHeight;
        }
      }

      drawSimpleBox(
        "BELIEFS & CONVICTIONS",
        sectionStart - lineHeight,
        yPosition
      );
      yPosition += sectionSpacing * 2;
    }

    // Notes and descriptions on the last page
    if (
      sheet.notes ||
      sheet.notes2 ||
      sheet.history ||
      sheet.appearance_description
    ) {
      pdf.addPage();
      yPosition = margin;
      sectionStart = yPosition;

      if (sheet.history) {
        pdf.setFont("helvetica", "bold");
        pdf.text("History", margin + 10, yPosition);
        yPosition += lineHeight * 1.5;

        pdf.setFont("helvetica", "normal");
        const heightUsed = addWrappedText(
          sheet.history,
          margin + 15,
          yPosition,
          contentWidth - 30
        );
        yPosition += heightUsed + lineHeight;
      }

      if (sheet.appearance_description) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Appearance", margin + 10, yPosition);
        yPosition += lineHeight * 1.5;

        pdf.setFont("helvetica", "normal");
        const heightUsed = addWrappedText(
          sheet.appearance_description,
          margin + 15,
          yPosition,
          contentWidth - 30
        );
        yPosition += heightUsed + lineHeight;
      }

      if (sheet.notes) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Notes", margin + 10, yPosition);
        yPosition += lineHeight * 1.5;

        pdf.setFont("helvetica", "normal");
        const heightUsed = addWrappedText(
          sheet.notes,
          margin + 15,
          yPosition,
          contentWidth - 30
        );
        yPosition += heightUsed + lineHeight;
      }

      if (sheet.notes2) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Additional Notes", margin + 10, yPosition);
        yPosition += lineHeight * 1.5;

        pdf.setFont("helvetica", "normal");
        const heightUsed = addWrappedText(
          sheet.notes2,
          margin + 15,
          yPosition,
          contentWidth - 30
        );
        yPosition += heightUsed + lineHeight;
      }

      drawSimpleBox(
        "NOTES & DESCRIPTIONS",
        sectionStart - lineHeight,
        yPosition
      );
      yPosition += sectionSpacing * 2;
    }

    // HEALTH & WILLPOWER
    sectionStart = yPosition;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...colors.primary);
    pdf.text("HEALTH & WILLPOWER", margin, yPosition);
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(10);
    yPosition += lineHeight * 2;

    // Health
    const healthY = yPosition;
    const healthBoxY = healthY + lineHeight * 1.9;
    pdf.setFont("helvetica", "bold");
    pdf.text("Health", margin + 10, healthY);
    yPosition += lineHeight * 1.9;

    const healthTotal = sheet.health?.total || 10;
    const healthSuperficial = sheet.health?.superficial || 0;
    const healthAggravated = sheet.health?.aggravated || 0;

    for (let i = 0; i < healthTotal; i++) {
      const boxX = margin + 15 + i * 5;
      if (i < healthAggravated) {
        // Aggravated damage
        pdf.setFillColor(0, 0, 0);
        pdf.rect(boxX, healthBoxY - 2, 4, 4, "F");
        pdf.setTextColor(1, 1, 1);
        pdf.setFontSize(6);
        pdf.text("X", boxX + 1, healthBoxY + 1);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
      } else if (i < healthAggravated + healthSuperficial) {
        // Superficial damage
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.2);
        pdf.rect(boxX, healthBoxY - 2, 4, 4);
        pdf.line(boxX, healthBoxY - 2, boxX + 4, healthBoxY + 2);
      } else {
        // No damage
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.2);
        pdf.rect(boxX, healthBoxY - 2, 4, 4);
      }
    }
    yPosition += lineHeight * 2;

    // Willpower
    const willX = margin + 100;
    const willBoxY = healthY + lineHeight * 1.9; // Same Y position as Health boxes
    pdf.setFont("helvetica", "bold");
    pdf.text("Willpower", willX, healthY);

    const willTotal = sheet.willpower?.total || 10;
    const willSuperficial = sheet.willpower?.superficial || 0;
    const willAggravated = sheet.willpower?.aggravated || 0;

    for (let i = 0; i < willTotal; i++) {
      const boxX = willX + 5 + i * 5;
      if (i < willAggravated) {
        // Aggravated damage
        pdf.setFillColor(0, 0, 0);
        pdf.rect(boxX, willBoxY - 2, 4, 4, "F");
        pdf.setTextColor(1, 1, 1);
        pdf.setFontSize(6);
        pdf.text("X", boxX + 1, willBoxY + 1);
        pdf.setTextColor(0, 0, 0);
        pdf.setFontSize(10);
      } else if (i < willAggravated + willSuperficial) {
        // Superficial damage
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.2);
        pdf.rect(boxX, willBoxY - 2, 4, 4);
        pdf.line(boxX, willBoxY - 2, boxX + 4, willBoxY + 2);
      } else {
        // No damage
        pdf.setDrawColor(0, 0, 0);
        pdf.setLineWidth(0.2);
        pdf.rect(boxX, willBoxY - 2, 4, 4);
      }
    }
    yPosition += lineHeight * 2;

    // Border of the HEALTH & WILLPOWER section
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.2);
    pdf.rect(
      margin - 3,
      sectionStart - 5,
      contentWidth + 6,
      yPosition - sectionStart + 5
    );
    yPosition += sectionSpacing * 2;

    // EXPERIENCE
    sectionStart = yPosition;
    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(12);
    pdf.setTextColor(...colors.primary);
    pdf.text("EXPERIENCE", margin, yPosition);
    pdf.setTextColor(...colors.text);
    pdf.setFontSize(10);
    yPosition += lineHeight * 2;

    const expY = yPosition;
    const expCurrentY = expY + lineHeight * 1.5; // Explicit Y for Current
    const expTotalY = expCurrentY + lineHeight; // Explicit Y for Total
    pdf.setFont("helvetica", "bold");
    pdf.text("Experience", margin + 10, expY);
    yPosition += lineHeight * 1.5;

    pdf.setFont("helvetica", "normal");
    if (sheet.exp) {
      pdf.text(`Current: ${sheet.exp.current || 0}`, margin + 15, expCurrentY);
      yPosition += lineHeight;
      pdf.text(`Total: ${sheet.exp.total || 0}`, margin + 15, expTotalY);
    } else {
      pdf.text(`Current: ${sheet.exp_current || 0}`, margin + 15, expCurrentY);
      yPosition += lineHeight;
      pdf.text(`Total: ${sheet.exp_total || 0}`, margin + 15, expTotalY);
    }
    yPosition += lineHeight;

    // Border of the EXPERIENCE section
    pdf.setDrawColor(...colors.border);
    pdf.setLineWidth(0.2);
    pdf.rect(
      margin - 3,
      sectionStart - 5,
      contentWidth + 6,
      yPosition - sectionStart + 5
    );
    yPosition += sectionSpacing * 2;

    // HAVEN
    if (sheet.haven_name || sheet.haven_location || sheet.haven_description) {
      sectionStart = yPosition;
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(12);
      pdf.setTextColor(...colors.primary);
      pdf.text("HAVEN", margin, yPosition);
      pdf.setTextColor(...colors.text);
      pdf.setFontSize(10);
      yPosition += lineHeight * 2;

      if (sheet.haven_name) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Name", margin + 10, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(sheet.haven_name, margin + 50, yPosition);
        yPosition += lineHeight * 1.5;
      }

      if (sheet.haven_location) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Location", margin + 10, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(sheet.haven_location, margin + 50, yPosition);
        yPosition += lineHeight * 1.5;
      }

      if (sheet.haven_description) {
        pdf.setFont("helvetica", "bold");
        pdf.text("Description", margin + 10, yPosition);
        pdf.setFont("helvetica", "normal");
        pdf.text(sheet.haven_description || "", margin + 50, yPosition);
        yPosition += lineHeight * 1.5;
      }

      // Border of the HAVEN section
      pdf.setDrawColor(...colors.border);
      pdf.setLineWidth(0.2);
      pdf.rect(
        margin - 3,
        sectionStart - 5,
        contentWidth + 6,
        yPosition - sectionStart + 5
      );
    }

    // Save the PDF
    const fileName = `${sheet.name || "character"}_V5.pdf`;
    pdf.save(fileName);
  }

  return (
    <Tooltip title="Export as PDF">
      <IconButton onClick={generateV5PDF}>
        <PictureAsPdfIcon fontSize="large" color="secondary" />
      </IconButton>
    </Tooltip>
  );
}
