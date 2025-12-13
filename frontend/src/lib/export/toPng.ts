import { toPng as htmlToPng } from "html-to-image";

export async function exportToPng(
  element: HTMLElement,
  filename: string = "diagram.png",
  scale: number = 2
): Promise<void> {
  try {
    const dataUrl = await htmlToPng(element, {
      pixelRatio: scale,
      backgroundColor: "#FFFFFF",
    });

    // Create download link
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    link.click();
  } catch (error) {
    console.error("Failed to export PNG:", error);
    throw error;
  }
}

export async function getPngDataUrl(
  element: HTMLElement,
  scale: number = 2
): Promise<string> {
  return htmlToPng(element, {
    pixelRatio: scale,
    backgroundColor: "#FFFFFF",
  });
}
