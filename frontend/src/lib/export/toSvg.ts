import { toSvg as htmlToSvg } from "html-to-image";

export async function exportToSvg(
  element: HTMLElement,
  filename: string = "diagram.svg"
): Promise<void> {
  try {
    const dataUrl = await htmlToSvg(element, {
      backgroundColor: "#FFFFFF",
    });

    // Create download link
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to export SVG:", error);
    throw error;
  }
}

// Alternative: serialize SVG directly from the DOM
export function serializeSvg(svgElement: SVGSVGElement): string {
  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(svgElement);

  // Add XML declaration and doctype
  svgString = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgString;

  return svgString;
}

export function downloadSvgString(
  svgString: string,
  filename: string = "diagram.svg"
): void {
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.download = filename;
  link.href = url;
  link.click();

  URL.revokeObjectURL(url);
}
