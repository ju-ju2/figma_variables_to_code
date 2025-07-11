import { on } from "../common/fromPlugin";
import { commitMultipleFilesToGithub } from "./github";

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
        await commitMultipleFilesToGithub(
          githubRepositoryUrl,
          githubAccessToken,
          commitTitle,
          scss,
          isRememberInfo
        );

        figma.closePlugin();
        figma.notify("Scss Pull Request", { timeout: 5000 });
      } catch (err) {
        console.log("err", err);
        figma.notify("Scss Pull Request Failed", { timeout: 5000 });
      }
    }
  );
}
