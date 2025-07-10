export function rgbaToHex(r: number, g: number, b: number, a?: number) {
  return (
    "#" +
    [r, g, b, a !== undefined ? a * 255 : undefined]
      .filter((x) => x !== undefined)
      .map((x) => {
        const hex = Math.round(x as number).toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
      .toUpperCase()
  );
}
