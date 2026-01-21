import Tesseract from "tesseract.js";

export async function recognizeImageText(file: File): Promise<string> {
  const { data } = await Tesseract.recognize(file, "eng+mon", {
    logger: () => {},
  });
  return data.text;
}
