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

export function toPascalCase(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]/g, " ") // 특수문자(-, / 등)를 공백으로
    .split(" ") // 공백 기준 split
    .filter(Boolean) // 빈 문자열 제거
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // 단어 첫 글자 대문자
    .join("");
}

export function toCamelCase(input: string): string {
  return input
    .replace(/[^a-zA-Z0-9]/g, " ") // 특수문자(-, / 등)를 공백으로
    .split(" ") // 공백 기준 분리
    .filter(Boolean) // 빈 문자열 제거
    .map((word, index) =>
      index === 0
        ? word.charAt(0).toLowerCase() + word.slice(1)
        : word.charAt(0).toUpperCase() + word.slice(1)
    )
    .join("");
}
