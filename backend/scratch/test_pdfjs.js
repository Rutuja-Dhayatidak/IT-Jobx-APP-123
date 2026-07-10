async function test() {
  try {
    const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
    console.log("PDFJS Loaded:", typeof pdfjs.getDocument);
  } catch (e) {
    console.error("Failed to load PDFJS:", e);
  }
}
test();
