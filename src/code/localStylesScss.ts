// import { rgbaToHex } from "./shared";

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

async function getFontStyles() {
  const textStyles = await figma.getLocalTextStylesAsync();

  return textStyles.map((textStyle) => {
    const className = textStyle.name.split("/")[0];

    const getFontWeight = () => {
      const fontWeight = textStyle.fontName.style.toLowerCase();
      if (fontWeight === "bold") {
        return 700;
      } else if (fontWeight === "semibold") {
        return 600;
      } else if (fontWeight === "medium") {
        return 500;
      } else if (fontWeight === "regular") {
        return 400;
      } else {
        return 400;
      }
    };

    return `  "${className}-family": "${textStyle.fontName.family}",
  "${className}-size": ${textStyle.fontSize}px, 
  "${className}-weight": ${getFontWeight()},
  "${className}-line-height": ${
      (textStyle.lineHeight as LineHeightType).value
    }px,
  "${className}-letter-spacing": ${parseFloat(
      textStyle.letterSpacing.value.toFixed(2)
    )}%,
`;
  });
}

export const getLocalStyles = async () => {
  // const colors = await getColor();
  // const shadows = await getShadows();
  // const blurs = await getBlurs();
  const fontStyles = await getFontStyles();

  // const localStyles = [...colors, ...shadows, ...blurs, ...fontStyles];
  const localStyles = [...fontStyles];
  return localStyles;
};
