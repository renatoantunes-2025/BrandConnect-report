const UTF16LE_BOM = [0xff, 0xfe];

export function isUtf16leBom(buffer: Buffer): boolean {
  return (
    buffer.length >= 2 && buffer[0] === UTF16LE_BOM[0] && buffer[1] === UTF16LE_BOM[1]
  );
}

/** Decodifica exports "gráfico individual" do Meta Business Suite (UTF-16LE, com BOM). */
export function decodeUtf16File(buffer: Buffer): string {
  return buffer.toString("utf16le", 2);
}
