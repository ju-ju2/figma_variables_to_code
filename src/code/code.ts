import type { repoInfoType } from "./github";
import { listenDeployScss } from "./listeners";
import { getVariablesStyles } from "./variablesScss";
import { emit, type ActionsType } from "../common/fromPlugin";
import { ROOT_FILE_PATH } from "../constants/github";
import { getLocalStyles } from "./localStylesScss";
import { FIGMA_EVENT, FIGMA_MESSAGE, FIGMA_STORAGE } from "@/constants/figma";
// import { getVariablesStyles } from "./variablesScss";

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

export const styleLintCode =
  "/* stylelint-disable color-hex-length */\n/* stylelint-disable length-zero-no-unit */\n/* stylelint-disable scss/dollar-variable-pattern */";

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

const getStyles = async () => {
  const localStyles = await getLocalStyles();
  const variableStyles = await getVariablesStyles();

  const localStylesAction: ActionsType = {
    action: "create",
    file_path: `${ROOT_FILE_PATH}/localStyles/_index.scss`,
    content: `${styleLintCode}\n\n$localStyles: (\n${localStyles.join("\n")});`,
  };

  emit(FIGMA_EVENT.GET_SCSS_PREVIEW, {
    scss: {
      localStyles: localStylesAction,
      variables: variableStyles.actions,
    },
  });
};

const getRepoInfo = async () => {
  try {
    const figmaFileName = figma.root.name;

    const repoInfo: repoInfoType[] =
      (await figma.clientStorage.getAsync(FIGMA_STORAGE.REPO_INFO)) ?? [];

    const isExistRepo: repoInfoType = repoInfo.find(
      (item) => item.fileName === figmaFileName
    ) ?? { accessToken: "", fileName: "", repoUrl: "" };

    figma.ui.postMessage({
      type: FIGMA_MESSAGE.LOAD_REPO_INFO,
      payload: {
        accessToken: isExistRepo.accessToken,
        repoUrl: isExistRepo.repoUrl,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

(function main() {
  figma.showUI(__html__, { width: 420, height: 500 });
  getStyles();
  listenDeployScss();
  getRepoInfo();
})();
