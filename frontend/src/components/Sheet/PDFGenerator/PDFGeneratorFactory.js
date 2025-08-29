import Vampire5thEditablePDFGenerator from "./sheet/5th/Vampire5thEditablePDFGenerator";

/**
 * Factory for creating PDF generators for character sheets
 * Currently supports only Vampire 5th Edition editable PDFs
 */
export default class PDFGeneratorFactory {
  /**
   * Creates an appropriate PDF generator for the specified sheet type
   * @param {string} sheetType - Sheet type (v5, vampire5th, vampire5)
   * @param {object} sheet - Sheet data
   * @param {object} options - Additional options for the generator
   * @returns {Vampire5thEditablePDFGenerator} Instance of the V5 editable generator
   */
  static createGenerator(sheetType, sheet, options = {}) {
    switch (sheetType.toLowerCase()) {
      case "v5":
      case "vampire5th":
      case "vampire5":
        return new Vampire5thEditablePDFGenerator(sheet, options);

      default:
        throw new Error(`Unsupported sheet type: ${sheetType}. Only Vampire 5th Edition editable PDFs are supported.`);
    }
  }

  /**
   * Gets the list of supported sheet types
   * @returns {Array} Array of supported types
   */
  static getSupportedTypes() {
    return [
      { value: "v5", label: "Vampire 5th Edition (Editable PDF)", color: "#8B0000" },
    ];
  }

  /**
   * Checks if a sheet type is supported
   * @param {string} sheetType - Sheet type to check
   * @returns {boolean} True if supported, false otherwise
   */
  static isSupported(sheetType) {
    const supportedTypes = ["v5", "vampire5th", "vampire5"];
    return supportedTypes.includes(sheetType.toLowerCase());
  }
}
