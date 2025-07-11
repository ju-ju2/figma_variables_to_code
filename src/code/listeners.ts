import { on } from "../common/fromPlugin";
import { createGithubClient } from "./github";

export function listenDeployScss() {
  on(
    "PULL_REQUEST_SCSS",
    async ({
      githubRepositoryUrl,
      githubAccessToken,
      scss,
      commitTitle,
      isRememberInfo,
    }) => {
      try {
        const { createDeployMR } = await createGithubClient(
          githubRepositoryUrl,
          githubAccessToken,
          scss,
          commitTitle,
          isRememberInfo
        );
        await createDeployMR();

        figma.closePlugin();
        figma.notify("Scss Pull Request", { timeout: 5000 });
      } catch (err) {
        console.log("err", err);
        figma.notify("Scss Pull Request Failed", { timeout: 5000 });
      }
    }
  );
}
