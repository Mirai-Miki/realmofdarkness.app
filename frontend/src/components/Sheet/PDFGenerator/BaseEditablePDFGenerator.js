import { PDFDocument, PDFForm } from "pdf-lib";

/**
 * Abstract base class for generating editable character sheet PDFs
 * This class provides common functionalities for editing existing PDF forms
 */
export default class BaseEditablePDFGenerator {
  constructor(sheet, options = {}) {
    this.sheet = sheet;
    this.options = {
      templatePath: "/static/pdfSheets/v5 WintersTeeth 4-Page Interactive.pdf",
      ...options,
    };
  }

  /**
   * Main method that must be implemented by each subclass
   */
  async generate() {
    throw new Error(
      "The generate() method must be implemented by the subclass"
    );
  }

  /**
   * Loads the PDF template
   */
  async loadTemplate() {
    try {
      console.log("Loading PDF template from:", this.options.templatePath);
      const response = await fetch(this.options.templatePath);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const templateBytes = await response.arrayBuffer();
      console.log("PDF loaded, size:", templateBytes.byteLength, "bytes");

      const pdfDoc = await PDFDocument.load(templateBytes);
      console.log("PDF document loaded successfully");
      return pdfDoc;
    } catch (error) {
      console.error("Error loading PDF template:", error);
      throw new Error(`Error loading PDF template: ${error.message}`);
    }
  }

  /**
   * Gets the form fields from the PDF
   */
  async getFormFields(pdfDoc) {
    const form = pdfDoc.getForm();
    const fields = form.getFields();
    return fields;
  }

  /**
   * Fills a text field in the PDF form
   */
  fillTextField(form, fieldName, value) {
    try {
      const field = form.getTextField(fieldName);
      if (field && value !== undefined && value !== null) {
        field.setText(value.toString());
      }
    } catch (error) {
      //console.warn(`Could not fill field ${fieldName}: ${error.message}`);
    }
  }

  /**
   * Fills a checkbox field in the PDF form
   */
  fillCheckboxField(form, fieldName, checked) {
    try {
      const field = form.getCheckBox(fieldName);
      if (field) {
        if (checked) {
          field.check();
        } else {
          field.uncheck();
        }
      }
    } catch (error) {
      console.warn(`Could not fill checkbox ${fieldName}: ${error.message}`);
    }
  }

  /**
   * Fills radio button fields in the PDF form
   */
  fillRadioField(form, fieldName, value) {
    try {
      const field = form.getRadioGroup(fieldName);
      if (field && value !== undefined && value !== null) {
        field.select(value.toString());
      }
    } catch (error) {
      console.warn(`Could not fill radio field ${fieldName}: ${error.message}`);
    }
  }

  /**
   * Saves the PDF with the specified filename
   */
  async save(pdfDoc, fileName) {
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Gets the PDF as blob (useful for preview or upload)
   */
  async getBlob(pdfDoc) {
    const pdfBytes = await pdfDoc.save();
    return new Blob([pdfBytes], { type: "application/pdf" });
  }

  /**
   * Gets the PDF as base64 (useful for preview)
   */
  async getBase64(pdfDoc) {
    const pdfBytes = await pdfDoc.save();
    const base64 = btoa(String.fromCharCode(...new Uint8Array(pdfBytes)));
    return `data:application/pdf;base64,${base64}`;
  }
}
