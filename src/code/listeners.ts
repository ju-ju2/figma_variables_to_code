import { on } from "../common/fromPlugin";
import { createGithubClient } from "./github";

export function listenDeployScss() {
  on(
    "MERGE_REQUEST_SCSS",
    async ({
      gitlabRepositoryUrl,
      gitlabAccessToken,
      scss,
      commitTitle,
      isRememberInfo,
    }) => {
      try {
        const { createDeployMR } = await createGithubClient(
          gitlabRepositoryUrl,
          gitlabAccessToken,
          scss,
          commitTitle,
          isRememberInfo
        );
        await createDeployMR();

        figma.closePlugin();
        figma.notify("Scss Merge Request", { timeout: 5000 });
      } catch (err) {
        console.log("err", err);
        figma.notify("Scss Merge Request Failed", { timeout: 5000 });
      }
    }
  );
}
