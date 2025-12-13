import jsPDF from "jspdf";
import { toPng } from "html-to-image";

export async function exportToPdf(
  element: HTMLElement,
  filename: string = "diagram.pdf",
  options: {
    width?: number;
    height?: number;
    orientation?: "portrait" | "landscape";
  } = {}
): Promise<void> {
  try {
    // Get element dimensions
    const rect = element.getBoundingClientRect();
    const width = options.width || rect.width;
    const height = options.height || rect.height;

    // Determine orientation
    const orientation = options.orientation || (width > height ? "landscape" : "portrait");

    // Create PDF with appropriate size
    const pdf = new jsPDF({
      orientation,
      unit: "px",
      format: [width, height],
    });

    // Convert to PNG first (for better quality)
    const dataUrl = await toPng(element, {
      pixelRatio: 2,
      backgroundColor: "#FFFFFF",
    });

    // Add image to PDF
    pdf.addImage(dataUrl, "PNG", 0, 0, width, height);

    // Save
    pdf.save(filename);
  } catch (error) {
    console.error("Failed to export PDF:", error);
    throw error;
  }
}
