import BaseEditablePDFGenerator from "../../BaseEditablePDFGenerator";

/**
 * Generator for Vampire 5th Edition editable PDF character sheets
 * Uses the WintersTeeth 4-Page Interactive PDF as template
 */
export default class Vampire5thEditablePDFGenerator extends BaseEditablePDFGenerator {
  constructor(sheet, options = {}) {
    super(sheet, {
      templatePath: "/static/pdfSheets/v5 WintersTeeth 4-Page Interactive.pdf",
      ...options,
    });
  }

  /**
   * Maps character data to PDF form fields
   */
  async generate() {
    try {
      // Load the PDF template
      const pdfDoc = await this.loadTemplate();
      const form = pdfDoc.getForm();

      // Fill basic character information
      this.fillBasicInfo(form);

      // Fill attributes
      this.fillAttributes(form);

      // Fill skills
      this.fillSkills(form);

      // Fill disciplines and powers
      this.fillDisciplines(form);

      // Fill advantages and backgrounds
      this.fillAdvantages(form);

      // Fill blood potency and hunger
      this.fillBloodInfo(form);

      // Fill other sections
      this.fillOtherSections(form);

      // Fill specific dot fields
      this.fillSpecificDotFields(form);

      // Save the PDF
      const fileName = `${this.sheet.name || "character"}_V5_Editable.pdf`;
      await this.save(pdfDoc, fileName);

      return pdfDoc;
    } catch (error) {
      throw new Error(`Error generating editable PDF: ${error.message}`);
    }
  }

  /**
   * Fills basic character information
   */
    fillBasicInfo(form) {
    const { sheet } = this;

    //console.log("📝 Filling basic character information...");

    // Main character fields (using exact PDF field names)
    this.fillTextField(form, "name", sheet.name);
    this.fillTextField(form, "Player Name", sheet.player_name);
    this.fillTextField(form, "chronicle", sheet.chronicle?.name);
    
    // Try different approaches for the clan field
    this.fillTextField(form, "clan", sheet.clan); // Real field found
    
    this.fillTextField(form, "generation", sheet.generation); // Real field found
    this.fillTextField(form, "sire", sheet.sire); // Real field found
    this.fillTextField(form, "desire", sheet.desire); // Real field found
    
    // Other basic fields
    this.fillTextField(form, "Predator Type", sheet.predator_type);
    this.fillTextField(form, "concept", sheet.concept);
    this.fillTextField(form, "ambition", sheet.ambition);
    this.fillTextField(form, "Touchstone", sheet.touchstone);

    // Description fields (found in logs)
    this.fillTextField(form, "description", sheet.description); // Real field found
    this.fillTextField(form, "description5", sheet.appearance); // Could be appearance
    this.fillTextField(form, "haven_name", sheet.haven_name);
    this.fillTextField(form, "haven_description", sheet.haven_description);

    //console.log("✅ Basic information filled");
  }


  /**
   * Fills attributes section
   */
  fillAttributes(form) {
    const { sheet } = this;

    // Physical attributes
    this.fillAttributeDots(form, "Strength", sheet.attributes?.strength);
    this.fillAttributeDots(form, "Dexterity", sheet.attributes?.dexterity);
    this.fillAttributeDots(form, "Stamina", sheet.attributes?.stamina);

    // Social attributes
    this.fillAttributeDots(form, "Charisma", sheet.attributes?.charisma);
    this.fillAttributeDots(form, "Manipulation", sheet.attributes?.manipulation);
    this.fillAttributeDots(form, "Composure", sheet.attributes?.composure);

    // Mental attributes
    this.fillAttributeDots(form, "Intelligence", sheet.attributes?.intelligence);
    this.fillAttributeDots(form, "Wits", sheet.attributes?.wits);
    this.fillAttributeDots(form, "Resolve", sheet.attributes?.resolve);
  }

  /**
   * Fills skills section
   */
  fillSkills(form) {
    const { sheet } = this;

    // Physical skills
    this.fillSkillDots(form, "Athletics", sheet.skills?.athletics?.value);
    this.fillSkillDots(form, "Brawl", sheet.skills?.brawl?.value);
    this.fillSkillDots(form, "Craft", sheet.skills?.craft?.value);
    this.fillSkillDots(form, "Drive", sheet.skills?.drive?.value);
    this.fillSkillDots(form, "Firearms", sheet.skills?.firearms?.value);
    this.fillSkillDots(form, "Larceny", sheet.skills?.larceny?.value);
    this.fillSkillDots(form, "Melee", sheet.skills?.melee?.value);
    this.fillSkillDots(form, "Stealth", sheet.skills?.stealth?.value);
    this.fillSkillDots(form, "Survival", sheet.skills?.survival?.value);

    // Social skills
    this.fillSkillDots(form, "Animal Ken", sheet.skills?.animal_ken?.value);
    this.fillSkillDots(form, "Etiquette", sheet.skills?.etiquette?.value);
    this.fillSkillDots(form, "Insight", sheet.skills?.insight?.value);
    this.fillSkillDots(form, "Intimidation", sheet.skills?.intimidation?.value);
    this.fillSkillDots(form, "Leadership", sheet.skills?.leadership?.value);
    this.fillSkillDots(form, "Performance", sheet.skills?.performance?.value);
    this.fillSkillDots(form, "Persuasion", sheet.skills?.persuasion?.value);
    this.fillSkillDots(form, "Streetwise", sheet.skills?.streetwise?.value);
    this.fillSkillDots(form, "Subterfuge", sheet.skills?.subterfuge?.value);

    // Mental skills
    this.fillSkillDots(form, "Academics", sheet.skills?.academics?.value);
    this.fillSkillDots(form, "Awareness", sheet.skills?.awareness?.value);
    this.fillSkillDots(form, "Finance", sheet.skills?.finance?.value);
    this.fillSkillDots(form, "Investigation", sheet.skills?.investigation?.value);
    this.fillSkillDots(form, "Medicine", sheet.skills?.medicine?.value);
    this.fillSkillDots(form, "Occult", sheet.skills?.occult?.value);
    this.fillSkillDots(form, "Politics", sheet.skills?.politics?.value);
    this.fillSkillDots(form, "Science", sheet.skills?.science?.value);
    this.fillSkillDots(form, "Technology", sheet.skills?.technology?.value);
  }

  /**
   * Fills disciplines and powers
   */
  fillDisciplines(form) {
    const { sheet } = this;

    // Fill discipline levels
    if (sheet.disciplines) {
      Object.entries(sheet.disciplines).forEach(([discipline, level]) => {
        this.fillTextField(form, `${discipline} Level`, level);
      });
    }

    // Fill discipline powers
    if (sheet.discipline_powers) {
      Object.entries(sheet.discipline_powers).forEach(
        ([discipline, powers]) => {
          if (Array.isArray(powers)) {
            powers.forEach((power, index) => {
              this.fillTextField(
                form,
                `${discipline} Power ${index + 1}`,
                power
              );
            });
          }
        }
      );
    }
  }

  /**
   * Fills advantages and backgrounds
   */
  fillAdvantages(form) {
    const { sheet } = this;

    // Fill backgrounds
    if (sheet.backgrounds) {
      Object.entries(sheet.backgrounds).forEach(([background, value]) => {
        this.fillTextField(form, background, value);
      });
    }

    // Fill merits and flaws
    if (sheet.merits) {
      Object.entries(sheet.merits).forEach(([merit, value]) => {
        this.fillTextField(form, merit, value);
      });
    }
  }

  /**
   * Fills blood potency and hunger information
   */
  fillBloodInfo(form) {
    const { sheet } = this;

    this.fillTextField(form, "Blood Potency", sheet.blood_potency);
    this.fillTextField(form, "Hunger", sheet.hunger);
    this.fillTextField(form, "Humanity", sheet.humanity);
    this.fillTextField(form, "Willpower", sheet.willpower);
    this.fillTextField(form, "Max Willpower", sheet.max_willpower);
  }

  /**
   * Fills other sections
   */
  fillOtherSections(form) {
    const { sheet } = this;

    // Fill experience
    this.fillTextField(form, "Experience", sheet.experience);
    this.fillTextField(form, "Total Experience", sheet.total_experience);

    // Fill notes
    this.fillTextField(form, "Notes", sheet.notes);

    // Fill appearance
    this.fillTextField(form, "Appearance", sheet.appearance);

    // Fill description
    this.fillTextField(form, "Description", sheet.description);
  }

  /**
   * Fills specific dot fields that need to be activated
   * This method maps character data to PDF dot fields using the complete mapping from PDFDotActivatorByPage
   */
  fillSpecificDotFields(form) {
    const { sheet } = this;

    // Complete mapping of dots to skills with specific levels
    const dotMapping = this.getDotMapping();

    //console.log("📝 Applying automatic skill mapping to dots...");

    // Function to get skill value according to type
    const getSkillValue = (skillName, type) => {
      if (type === "attribute") {
        return sheet.attributes?.[skillName] || 0;
      } else if (type === "skill") {
        // Skills have a structure with .value
        return sheet.skills?.[skillName]?.value || 0;
      }
      return 0;
    };

    // Activate dots according to skill and attribute values
    // First get list of existing fields
    const form_fields = form.getFields();
    const existingFieldNames = form_fields.map(f => f.getName());

    Object.entries(dotMapping).forEach(([dotName, config]) => {
      const { skill, level, type } = config;
      const skillValue = getSkillValue(skill, type);
      const shouldActivate = skillValue >= level;
      
      // Only try to activate if the field exists in the PDF
      if (!existingFieldNames.includes(dotName)) {
        if (level === 5) {
          //console.log(`⚠️ Level 5 field does not exist: ${dotName} - ${skill} (${type})`);
        }
        return;
      }
      
      if (shouldActivate) {
        this.fillCheckboxField(form, dotName, true);
        //console.log(`✅ Activated ${dotName}: ${skill} (${type}) level ${level} - current value: ${skillValue}`);
      } else if (skillValue > 0) {
        //console.log(`❌ NOT activated ${dotName}: ${skill} (${type}) level ${level} - current value: ${skillValue} (insufficient)`);
      }
    });

    //console.log("🔍 Automatic dot mapping completed - using 'ab' pattern for level 5");
    //console.log("✅ Skill mapping completed");
  }

  /**
   * Helper method to fill attribute dots
   */
  fillAttributeDots(form, attributeName, value) {
    if (value === undefined || value === null) return;

    // Try to fill the attribute value field
    this.fillTextField(form, attributeName, value);

    // Also try to fill individual dot fields
    for (let i = 1; i <= 5; i++) {
      const fieldName = `${attributeName} ${i}`;
      this.fillCheckboxField(form, fieldName, i <= value);
    }
  }

  /**
   * Helper method to fill skill dots
   */
  fillSkillDots(form, skillName, value) {
    if (value === undefined || value === null) return;

    // Try to fill the skill value field
    this.fillTextField(form, skillName, value);

    // Also try to fill individual dot fields
    for (let i = 1; i <= 5; i++) {
      const fieldName = `${skillName} ${i}`;
      this.fillCheckboxField(form, fieldName, i <= value);
    }
  }

  /**
   * Method to activate a specific dot field by name
   * @param {string} fieldName - The exact field name from the PDF
   * @param {boolean} active - Whether to activate (true) or deactivate (false) the field
   */
  activateSpecificDot(form, fieldName, active = true) {
    this.fillCheckboxField(form, fieldName, active);
    //console.log(`Activated field ${fieldName}: ${active}`);
  }

  /**
   * Returns the complete mapping of PDF dot fields to character skills/attributes
   * Maps each skill/attribute level to its corresponding checkbox field in the PDF
   */
  getDotMapping() {
    return {
      // Attributes - each level has its own dot
      dot5b: { skill: "strength", level: 1, type: "attribute" },
      dot6b: { skill: "strength", level: 2, type: "attribute" },
      dot7b: { skill: "strength", level: 3, type: "attribute" },
      dot8b: { skill: "strength", level: 4, type: "attribute" },
      dot8ab: { skill: "strength", level: 5, type: "attribute" },

      dot13b: { skill: "dexterity", level: 1, type: "attribute" },
      dot14b: { skill: "dexterity", level: 2, type: "attribute" },
      dot15b: { skill: "dexterity", level: 3, type: "attribute" },
      dot16b: { skill: "dexterity", level: 4, type: "attribute" },
      dot16ab: { skill: "dexterity", level: 5, type: "attribute" },

      dot21b: { skill: "stamina", level: 1, type: "attribute" },
      dot22b: { skill: "stamina", level: 2, type: "attribute" },
      dot23b: { skill: "stamina", level: 3, type: "attribute" },
      dot24b: { skill: "stamina", level: 4, type: "attribute" },
      dot24ab: { skill: "stamina", level: 5, type: "attribute" },

      dot29b: { skill: "charisma", level: 1, type: "attribute" },
      dot30b: { skill: "charisma", level: 2, type: "attribute" },
      dot31b: { skill: "charisma", level: 3, type: "attribute" },
      dot32b: { skill: "charisma", level: 4, type: "attribute" },
      dot32ab: { skill: "charisma", level: 5, type: "attribute" },

      dot37b: { skill: "manipulation", level: 1, type: "attribute" },
      dot38b: { skill: "manipulation", level: 2, type: "attribute" },
      dot39b: { skill: "manipulation", level: 3, type: "attribute" },
      dot40b: { skill: "manipulation", level: 4, type: "attribute" },
      dot40ab: { skill: "manipulation", level: 5, type: "attribute" },

      dot45b: { skill: "composure", level: 1, type: "attribute" },
      dot46b: { skill: "composure", level: 2, type: "attribute" },
      dot47b: { skill: "composure", level: 3, type: "attribute" },
      dot48b: { skill: "composure", level: 4, type: "attribute" },
      dot48ab: { skill: "composure", level: 5, type: "attribute" },

      dot53b: { skill: "intelligence", level: 1, type: "attribute" },
      dot54b: { skill: "intelligence", level: 2, type: "attribute" },
      dot55b: { skill: "intelligence", level: 3, type: "attribute" },
      dot56b: { skill: "intelligence", level: 4, type: "attribute" },
      dot56ab: { skill: "intelligence", level: 5, type: "attribute" },

      dot61b: { skill: "wits", level: 1, type: "attribute" },
      dot62b: { skill: "wits", level: 2, type: "attribute" },
      dot63b: { skill: "wits", level: 3, type: "attribute" },
      dot64b: { skill: "wits", level: 4, type: "attribute" },
      dot64ab: { skill: "wits", level: 5, type: "attribute" },

      dot69b: { skill: "resolve", level: 1, type: "attribute" },
      dot70b: { skill: "resolve", level: 2, type: "attribute" },
      dot71b: { skill: "resolve", level: 3, type: "attribute" },
      dot72b: { skill: "resolve", level: 4, type: "attribute" },
      dot72ab: { skill: "resolve", level: 5, type: "attribute" },

      // Physical Skills
      dot77b: { skill: "athletics", level: 1, type: "skill" },
      dot78b: { skill: "athletics", level: 2, type: "skill" },
      dot79b: { skill: "athletics", level: 3, type: "skill" },
      dot80b: { skill: "athletics", level: 4, type: "skill" },
      dot80ab: { skill: "athletics", level: 5, type: "skill" },

      dot85b: { skill: "brawl", level: 1, type: "skill" },
      dot86b: { skill: "brawl", level: 2, type: "skill" },
      dot87b: { skill: "brawl", level: 3, type: "skill" },
      dot88b: { skill: "brawl", level: 4, type: "skill" },
      dot88ab: { skill: "brawl", level: 5, type: "skill" },

      dot93b: { skill: "craft", level: 1, type: "skill" },
      dot94b: { skill: "craft", level: 2, type: "skill" },
      dot95b: { skill: "craft", level: 3, type: "skill" },
      dot96b: { skill: "craft", level: 4, type: "skill" },
      dot96ab: { skill: "craft", level: 5, type: "skill" },

      dot101b: { skill: "drive", level: 1, type: "skill" },
      dot102b: { skill: "drive", level: 2, type: "skill" },
      dot103b: { skill: "drive", level: 3, type: "skill" },
      dot104b: { skill: "drive", level: 4, type: "skill" },
      dot104ab: { skill: "drive", level: 5, type: "skill" },

      dot109b: { skill: "firearms", level: 1, type: "skill" },
      dot110b: { skill: "firearms", level: 2, type: "skill" },
      dot111b: { skill: "firearms", level: 3, type: "skill" },
      dot112b: { skill: "firearms", level: 4, type: "skill" },
      dot112ab: { skill: "firearms", level: 5, type: "skill" },

      dot117b: { skill: "larceny", level: 1, type: "skill" },
      dot118b: { skill: "larceny", level: 2, type: "skill" },
      dot119b: { skill: "larceny", level: 3, type: "skill" },
      dot120b: { skill: "larceny", level: 4, type: "skill" },
      dot120ab: { skill: "larceny", level: 5, type: "skill" },

      dot125b: { skill: "melee", level: 1, type: "skill" },
      dot126b: { skill: "melee", level: 2, type: "skill" },
      dot127b: { skill: "melee", level: 3, type: "skill" },
      dot128b: { skill: "melee", level: 4, type: "skill" },
      dot128ab: { skill: "melee", level: 5, type: "skill" },

      dot133b: { skill: "stealth", level: 1, type: "skill" },
      dot134b: { skill: "stealth", level: 2, type: "skill" },
      dot135b: { skill: "stealth", level: 3, type: "skill" },
      dot136b: { skill: "stealth", level: 4, type: "skill" },
      dot136ab: { skill: "stealth", level: 5, type: "skill" },

      dot141b: { skill: "survival", level: 1, type: "skill" },
      dot142b: { skill: "survival", level: 2, type: "skill" },
      dot143b: { skill: "survival", level: 3, type: "skill" },
      dot144b: { skill: "survival", level: 4, type: "skill" },
      dot144ab: { skill: "survival", level: 5, type: "skill" },

      // Social Skills
      dot149b: { skill: "animal_ken", level: 1, type: "skill" },
      dot150b: { skill: "animal_ken", level: 2, type: "skill" },
      dot151b: { skill: "animal_ken", level: 3, type: "skill" },
      dot152b: { skill: "animal_ken", level: 4, type: "skill" },
      dot152ab: { skill: "animal_ken", level: 5, type: "skill" },

      dot157b: { skill: "etiquette", level: 1, type: "skill" },
      dot158b: { skill: "etiquette", level: 2, type: "skill" },
      dot159b: { skill: "etiquette", level: 3, type: "skill" },
      dot160b: { skill: "etiquette", level: 4, type: "skill" },
      dot160ab: { skill: "etiquette", level: 5, type: "skill" },

      dot165b: { skill: "insight", level: 1, type: "skill" },
      dot166b: { skill: "insight", level: 2, type: "skill" },
      dot167b: { skill: "insight", level: 3, type: "skill" },
      dot168b: { skill: "insight", level: 4, type: "skill" },
      dot168ab: { skill: "insight", level: 5, type: "skill" },

      dot173b: { skill: "intimidation", level: 1, type: "skill" },
      dot174b: { skill: "intimidation", level: 2, type: "skill" },
      dot175b: { skill: "intimidation", level: 3, type: "skill" },
      dot176b: { skill: "intimidation", level: 4, type: "skill" },
      dot176ab: { skill: "intimidation", level: 5, type: "skill" },

      dot181b: { skill: "leadership", level: 1, type: "skill" },
      dot182b: { skill: "leadership", level: 2, type: "skill" },
      dot183b: { skill: "leadership", level: 3, type: "skill" },
      dot184b: { skill: "leadership", level: 4, type: "skill" },
      dot184ab: { skill: "leadership", level: 5, type: "skill" },

      dot189b: { skill: "performance", level: 1, type: "skill" },
      dot190b: { skill: "performance", level: 2, type: "skill" },
      dot191b: { skill: "performance", level: 3, type: "skill" },
      dot192b: { skill: "performance", level: 4, type: "skill" },
      dot192ab: { skill: "performance", level: 5, type: "skill" },

      dot197b: { skill: "persuasion", level: 1, type: "skill" },
      dot198b: { skill: "persuasion", level: 2, type: "skill" },
      dot199b: { skill: "persuasion", level: 3, type: "skill" },
      dot200b: { skill: "persuasion", level: 4, type: "skill" },
      dot200ab: { skill: "persuasion", level: 5, type: "skill" },

      dot205b: { skill: "streetwise", level: 1, type: "skill" },
      dot206b: { skill: "streetwise", level: 2, type: "skill" },
      dot207b: { skill: "streetwise", level: 3, type: "skill" },
      dot208b: { skill: "streetwise", level: 4, type: "skill" },
      dot208ab: { skill: "streetwise", level: 5, type: "skill" },

      dot213b: { skill: "subterfuge", level: 1, type: "skill" },
      dot214b: { skill: "subterfuge", level: 2, type: "skill" },
      dot215b: { skill: "subterfuge", level: 3, type: "skill" },
      dot216b: { skill: "subterfuge", level: 4, type: "skill" },
      dot216ab: { skill: "subterfuge", level: 5, type: "skill" },

      // Mental Skills
      dot221b: { skill: "academics", level: 1, type: "skill" },
      dot222b: { skill: "academics", level: 2, type: "skill" },
      dot223b: { skill: "academics", level: 3, type: "skill" },
      dot224b: { skill: "academics", level: 4, type: "skill" },
      dot224ab: { skill: "academics", level: 5, type: "skill" },

      dot229b: { skill: "awareness", level: 1, type: "skill" },
      dot230b: { skill: "awareness", level: 2, type: "skill" },
      dot231b: { skill: "awareness", level: 3, type: "skill" },
      dot232b: { skill: "awareness", level: 4, type: "skill" },
      dot232ab: { skill: "awareness", level: 5, type: "skill" },

      dot237b: { skill: "finance", level: 1, type: "skill" },
      dot238b: { skill: "finance", level: 2, type: "skill" },
      dot239b: { skill: "finance", level: 3, type: "skill" },
      dot240b: { skill: "finance", level: 4, type: "skill" },
      dot240ab: { skill: "finance", level: 5, type: "skill" },

      dot245b: { skill: "investigation", level: 1, type: "skill" },
      dot246b: { skill: "investigation", level: 2, type: "skill" },
      dot247b: { skill: "investigation", level: 3, type: "skill" },
      dot248b: { skill: "investigation", level: 4, type: "skill" },
      dot248ab: { skill: "investigation", level: 5, type: "skill" },

      dot253b: { skill: "medicine", level: 1, type: "skill" },
      dot254b: { skill: "medicine", level: 2, type: "skill" },
      dot255b: { skill: "medicine", level: 3, type: "skill" },
      dot256b: { skill: "medicine", level: 4, type: "skill" },
      dot256ab: { skill: "medicine", level: 5, type: "skill" },

      dot261b: { skill: "occult", level: 1, type: "skill" },
      dot262b: { skill: "occult", level: 2, type: "skill" },
      dot263b: { skill: "occult", level: 3, type: "skill" },
      dot264b: { skill: "occult", level: 4, type: "skill" },
      dot264ab: { skill: "occult", level: 5, type: "skill" },

      dot269b: { skill: "politics", level: 1, type: "skill" },
      dot270b: { skill: "politics", level: 2, type: "skill" },
      dot271b: { skill: "politics", level: 3, type: "skill" },
      dot272b: { skill: "politics", level: 4, type: "skill" },
      dot272ab: { skill: "politics", level: 5, type: "skill" },

      dot277b: { skill: "science", level: 1, type: "skill" },
      dot278b: { skill: "science", level: 2, type: "skill" },
      dot279b: { skill: "science", level: 3, type: "skill" },
      dot280b: { skill: "science", level: 4, type: "skill" },
      dot280ab: { skill: "science", level: 5, type: "skill" },

      dot285b: { skill: "technology", level: 1, type: "skill" },
      dot286b: { skill: "technology", level: 2, type: "skill" },
      dot287b: { skill: "technology", level: 3, type: "skill" },
      dot288b: { skill: "technology", level: 4, type: "skill" },
      dot288ab: { skill: "technology", level: 5, type: "skill" },
    };
  }
}
