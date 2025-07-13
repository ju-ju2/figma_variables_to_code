import type { FileFormatType } from "@/types/code";
import { toCamelCase } from "../shared";

type LineHeightType = {
  readonly value: number;
  readonly unit: "PIXELS" | "PERCENT";
};

// function replaceLowerCaseName(name: string) {
//   return name.replace(/\s+/g, "-").replace(/\//g, "-").toLowerCase();
// }

// const convertToColorCode = (color: RGBA | RGB) => {
//   const _color = { r: color.r * 255, b: color.b * 255, g: color.g * 255 };
//   const beautifiedColor =
//     "a" in color
//       ? rgbaToHex(_color.r, _color.g, _color.b, color.a)
//       : rgbaToHex(_color.r, _color.g, _color.b);

//   return beautifiedColor;
// };

// const getColor = async () => {
//   const paintStyles = await figma.getLocalPaintStylesAsync();
//   const filteredPaintStyles = paintStyles.filter((paintStyle) => {
//     const color = paintStyle.paints[0] as SolidPaint;
//     return color.type === "SOLID";
//   });

//   return filteredPaintStyles.map((paintStyle) => {
//     const paint = paintStyle.paints[0] as SolidPaint;

//     const hex = convertToColorCode({ ...paint.color, a: paint.opacity });
//     return `$${replaceLowerCaseName(paintStyle.name)}: ${hex};`;
//   });
// };

// const getShadows = async () => {
//   const effectStyles = await figma.getLocalEffectStylesAsync();

//   return effectStyles
//     .filter((effectStyle) => {
//       const effect = effectStyle.effects[0];
//       return effect.type === "DROP_SHADOW" || effect.type === "INNER_SHADOW";
//     })
//     .map((effectStyle) => {
//       const effect = effectStyle.effects[0];

//       if (effect.type !== "DROP_SHADOW" && effect.type !== "INNER_SHADOW") {
//         return "";
//       }

//       return `$${replaceLowerCaseName(effectStyle.name)}:${effect.offset.x}px ${
//         effect.offset.y
//       }px ${effect.radius}px ${convertToColorCode(effect.color)};`;
//     });
// };

// const getBlurs = async () => {
//   const effectStyles = await figma.getLocalEffectStylesAsync();

//   return effectStyles
//     .filter((effectStyle) => {
//       const effect = effectStyle.effects[0];
//       return effect.type === "BACKGROUND_BLUR" || effect.type === "LAYER_BLUR";
//     })
//     .map((effectStyle) => {
//       const effect = effectStyle.effects[0];

//       if (effect.type !== "BACKGROUND_BLUR" && effect.type !== "LAYER_BLUR") {
//         return "";
//       }

//       return `$${replaceLowerCaseName(effectStyle.name)}: blur(${
//         effect.radius
//       }px);`;
//     });
// };

const getFontStyles = async (format: FileFormatType) => {
  const textStyles = await figma.getLocalTextStylesAsync();
  if (textStyles.length === 0) return [];

  if (format === "SCSS") {
    return textStyles.map((textStyle) => {
      const className = textStyle.name.split("/")[0];
      const fontFamily = textStyle.fontName.family;
      const fontSize = textStyle.fontSize;
      const fontWeight = textStyle.fontName.style.toLowerCase();
      const lineHeight = (textStyle.lineHeight as LineHeightType).value;
      const letterSpacing = parseFloat(
        textStyle.letterSpacing.value.toFixed(2)
      );
      const fontWeightValue =
        {
          bold: 700,
          semibold: 600,
          medium: 500,
          regular: 400,
        }[fontWeight] ?? 400;

      return `  "${className}-family": "${fontFamily}",
  "${className}-size": ${fontSize}px, 
  "${className}-weight": ${fontWeightValue},
  "${className}-line-height": ${lineHeight}px,
  "${className}-letter-spacing": ${letterSpacing}%,
`;
    });
  }

  if (format === "TS") {
    // TS 형식
    const classNames: string[] = [];

    const styleStrings = textStyles.map((textStyle) => {
      const className = toCamelCase(textStyle.name);
      classNames.push(className);

      const fontFamily = textStyle.fontName.family;
      const fontSize = textStyle.fontSize;
      const fontWeight = textStyle.fontName.style.toLowerCase();
      const lineHeight = (textStyle.lineHeight as LineHeightType).value;

      const rawLetterSpacing = textStyle.letterSpacing.value;
      const letterSpacing = parseFloat(
        (fontSize * (rawLetterSpacing / 100)).toFixed(2)
      );

      return `export const ${className} = {
  fontFamily: '${fontFamily}',
  fontSize: ${fontSize},
  fontWeight: '${fontWeight}',
  lineHeight: ${lineHeight},
  letterSpacing: ${letterSpacing},
};`;
    });

    const exportBlock = `\nexport const fontStyle = {\n  ${classNames.join(
      ",\n  "
    )},\n};`;

    const exportTypeBlock = `export type FontStyleType = keyof typeof fontStyle;\n`;
    return [...styleStrings, exportBlock, exportTypeBlock];
  }
};

export const getLocalStyles = async (format: FileFormatType) => {
  // const colors = await getColor();
  // const shadows = await getShadows();
  // const blurs = await getBlurs();
  const fontStyles = await getFontStyles(format);

  // const localStyles = [...colors, ...shadows, ...blurs, ...fontStyles];
  const localStyles = [...(fontStyles ?? [])];
  return localStyles;
};
