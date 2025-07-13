import { FIGMA_STORAGE, FIGMA_MESSAGE } from "@/constants/figma";
import type { RepoInfoType } from "./github";
import { listenDeployStyles } from "./listeners";

const initRepoInfo: RepoInfoType = {
  accessToken: "",
  fileName: "",
  repoUrl: "",
  fileType: "TS",
};

const getExistRepoInfo = async () => {
  const repoInfo: RepoInfoType[] =
    (await figma.clientStorage.getAsync(FIGMA_STORAGE.REPO_INFO)) ?? [];

  const figmaFileName = figma.root.name;

  const isExistRepo: RepoInfoType = repoInfo.find(
    (item) => item.fileName === figmaFileName
  ) ?? { ...initRepoInfo };

  return isExistRepo;
};

const getRepoInfo = async () => {
  try {
    const existRepo = await getExistRepoInfo();

    figma.ui.postMessage({
      type: FIGMA_MESSAGE.LOAD_REPO_INFO,
      payload: {
        accessToken: existRepo.accessToken,
        repoUrl: existRepo.repoUrl,
        fileType: existRepo.fileType,
      },
    });
  } catch (err) {
    console.log(err);
  }
};

(function main() {
  figma.showUI(__html__, { width: 420, height: 500 });
  listenDeployStyles();
  getRepoInfo();
})();
