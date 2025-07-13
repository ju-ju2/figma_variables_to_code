import { ROOT_FILE_PATH } from "@/constants/github";
import { getLocalStyles } from "./localStyles";
import { getVariablesStyles } from "./variables";
import { emit, type ActionsType } from "@/common/fromPlugin";
import { FIGMA_EVENT } from "@/constants/figma";

// const findDuplicateVariableNames = (variableStrings: string[]) => {
//   const nameSet = new Set();
//   const duplicates: string[] = [];

//   variableStrings.forEach((variableString) => {
//     // 변수 이름 추출 (':' 앞의 부분)
//     const variableName = variableString.split(":")[0].trim();

//     if (nameSet.has(variableName)) {
//       duplicates.push(variableName);
//     } else {
//       nameSet.add(variableName);
//     }
//   });

//   return duplicates;
// };

// const getStyles = async () => {
//   const localStyles = await getLocalStyles();
//   const variableStyles = await getVariablesStyles();

//   const scss = [...localStyles, ...variableStyles.css];
//   const duplicatesNames = findDuplicateVariableNames(scss);

//   if (duplicatesNames.length > 0) {
//     figma.ui.postMessage({
//       type: "error",
//       message: "Duplicate SCSS names.",
//       description: duplicatesNames,
//     });
//   } else {
//     const localStylesAction: ActionsType = {
//       action: "create",
//       file_path: `${ROOT_FILE_PATH}/localStyles/_index.scss`,
//       content: `${styleLintCode}\n\n$localStyles: (\n${localStyles.join(
//         "\n"
//       )});`,
//     };

//     emit("FIGMA_EVENT.GET_SCSS_PREVIEW", {
//       scss: {
//         localStyles: localStylesAction,
//         variables: variableStyles.actions,
//       },
//     });
//   }
// };

const styleLintCode =
  "/* stylelint-disable color-hex-length */\n/* stylelint-disable length-zero-no-unit */\n/* stylelint-disable scss/dollar-variable-pattern */";

export const getStyles = async (fileType: "SCSS" | "TS") => {
  const localStyles = await getLocalStyles(fileType);
  const variableStyles = await getVariablesStyles(fileType);
  const filePath = `${ROOT_FILE_PATH}/localStyles/${
    fileType === "SCSS" ? "_index.scss" : "index.ts"
  }`;

  const localStylesAction: ActionsType = {
    action: "create",
    file_path: filePath,
    content:
      fileType === "SCSS"
        ? `${styleLintCode}\n\n$localStyles: (\n${localStyles.join("\n")});`
        : `${localStyles.join("\n")}`,
  };

  emit(FIGMA_EVENT.GET_STYLES_PREVIEW, {
    styles: {
      localStyles: localStylesAction,
      variables: variableStyles.actions,
    },
  });
};
