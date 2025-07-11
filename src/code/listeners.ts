import { on } from "../common/fromPlugin";
import { commitMultipleFilesToGithub } from "./github";

export function listenDeployScss() {
  on(
    "PULL_REQUEST_SCSS",
    async ({
      githubRepositoryUrl,
      githubAccessToken,
      commitTitle,
      scss,
      baseBranch,
      isRememberInfo,
    }) => {
      try {
        const result = await commitMultipleFilesToGithub(
          githubRepositoryUrl,
          githubAccessToken,
          commitTitle,
          scss,
          baseBranch,
          isRememberInfo
        );

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
