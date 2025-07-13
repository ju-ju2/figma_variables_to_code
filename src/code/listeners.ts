import { FIGMA_EVENT, FIGMA_MESSAGE } from "@/constants/figma";
import { on } from "../common/fromPlugin";
import { commitMultipleFilesToGithub } from "./github";

export function listenDeployStyles() {
  on(
    FIGMA_EVENT.PULL_REQUEST_STYLES,
    async ({
      githubRepoUrl,
      githubAccessToken,
      commitTitle,
      styles,
      baseBranch,
      fileType,
      isRememberInfo,
    }) => {
      try {
        figma.ui.postMessage({ type: FIGMA_MESSAGE.LOADING_START });

        const result = await commitMultipleFilesToGithub({
          githubRepoUrl,
          githubAccessToken,
          commitTitle,
          styles,
          baseBranch,
          fileType,
          isRememberInfo,
        });

        figma.ui.postMessage({ type: FIGMA_MESSAGE.LOADING_END });

        if (result.success) {
          figma.closePlugin();
          figma.notify("✅ Pull Request 성공", { timeout: 5000 });
        } else {
          console.error("❌ Pull Request 실패:", result.error);
          figma.notify("❌ Pull Request 실패", { timeout: 5000 });
        }
      } catch (err) {
        console.log("🔥 예외 발생:", err);
        figma.notify("❌  Pull Request 예외 발생", { timeout: 5000 });
      }
    }
  );
}
