import type { ScssType } from "../common/fromPlugin";
import { BRANCH_NAME, ROOT_FILE_PATH } from "../constants/github";

export type repoInfoType = {
  fileName: string;
  repoUrl: string;
  accessToken: string;
};

export const createGithubClient = async (
  githubRepositoryUrl: string,
  githubAccessToken: string,
  scss: ScssType,
  commitTitle: string,
  isRememberInfo?: boolean
) => {
  let SHA = "";
  const GITHUB_TOKEN = githubAccessToken;
  const GITHUB_URL = "https://api.github.com";
  // https://github.com/Moodihood/frontend
  const OWNER = GITHUB_URL.split("/").slice(-2, -1)[0];
  const REPO = GITHUB_URL.split("/").slice(-1)[0];

  const checkScssBranchExists = async () => {
    const response = await fetch(
      `${GITHUB_URL}/repos/${OWNER}/${REPO}/branches/${BRANCH_NAME}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    return response.ok;
  };

  const createBranch = async () => {
    // Step 1. 기준 브랜치 SHA 가져오기
    const refRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/ref/heads/main`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: "application/vnd.github+json",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!refRes.ok) {
      throw new Error(
        "Failed to create branch: Failed to get reference for main branch"
      );
    }

    const data = await refRes.json();
    SHA = data.object.sha;

    // Step 2. 새로운 브랜치 생성
    const createBranchRes = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/git/refs`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          ref: `refs/heads/${BRANCH_NAME}`,
          sha: SHA,
        }),
      }
    );

    if (!createBranchRes.ok) {
      throw new Error("Failed to create branch");
    }

    return createBranchRes.json();
  };

  const scssBranchExists = await checkScssBranchExists();

  const checkFolderExists = async () => {
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${ROOT_FILE_PATH}?ref=${BRANCH_NAME}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to checkFolderExists");
    }

    const data = await response.json();
    return data.length > 0;
  };

  const createCommit = async (commitMessage: string, scss: ScssType) => {
    const folderExists = await checkFolderExists();

    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/contents/${ROOT_FILE_PATH}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          message: commitMessage,
          content: btoa(
            encodeURIComponent([scss.localStyles, ...scss.variables].join("\n"))
          ),
          branch: BRANCH_NAME,
          sha: folderExists ? SHA : undefined,
        }),
      }
    );

    // const actions = folderExists
    //   ? [
    //       { action: "delete", file_path: ROOT_FILE_PATH },
    //       scss.localStyles,
    //       ...scss.variables,
    //     ]
    //   : [scss.localStyles, ...scss.variables];

    // actions.push({
    //   file_path: `${ROOT_FILE_PATH}/_index.scss`,
    //   content: `@forward "localStyles";\n@forward "variables";`,
    //   action: "create",
    // });

    // const response = await fetch(`${GITLAB_API_URL}/repository/commits`, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${GITHUB_TOKEN}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     branch: BRANCH_NAME,
    //     commit_message: commitMessage,
    //     actions,
    //   }),
    // });

    if (!response.ok) {
      throw new Error("Failed to create commit");
    }

    return response.json();
  };

  const createPullRequest = async (
    sourceBranch: string,
    targetBranch: string,
    title: string,
    description: string
  ) => {
    const response = await fetch(
      `https://api.github.com/repos/${OWNER}/${REPO}/pulls`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          "X-GitHub-Api-Version": "2022-11-28",
        },
        body: JSON.stringify({
          head: sourceBranch,
          base: targetBranch,
          title,
          body: description,
        }),
      }
    );
    // const response = await fetch(`${GITLAB_API_URL}/merge_requests`, {
    //   method: "POST",
    //   headers: {
    //     Authorization: `Bearer ${GITHUB_TOKEN}`,
    //     "Content-Type": "application/json",
    //   },
    //   body: JSON.stringify({
    //     source_branch: sourceBranch,
    //     target_branch: targetBranch,
    //     title,
    //     description,
    //   }),
    // });

    if (!response.ok) {
      throw new Error("Failed to create pull request");
    }

    return response.json();
  };

  const createDeployMR = async () => {
    const _commitTitle =
      commitTitle === "" ? "feat: update token" : commitTitle;
    const prTitle = "update token";

    if (!scssBranchExists) {
      await createBranch();
    }
    await createCommit(_commitTitle, scss);
    if (!scssBranchExists) {
      await createPullRequest(BRANCH_NAME, "develop", prTitle, "");
    }

    if (isRememberInfo) {
      await setRepoInfo();
    } else {
      await deleteRepoInfo();
    }
  };

  const setRepoInfo = async () => {
    try {
      const existingRepoInfo: repoInfoType[] =
        (await figma.clientStorage.getAsync("repoInfo")) ?? [];

      const isExistFileName = existingRepoInfo.some(
        (item) => item.fileName === figma.root.name
      );

      const repoInfo: repoInfoType = {
        fileName: figma.root.name,
        repoUrl: githubRepositoryUrl,
        accessToken: githubAccessToken,
      };

      if (isExistFileName) {
        const updatedRepoInfo = existingRepoInfo.filter(
          (item) => item.fileName !== figma.root.name
        );

        updatedRepoInfo.push(repoInfo);
        await figma.clientStorage.setAsync("repoInfo", updatedRepoInfo);
        return;
      }

      if (existingRepoInfo.length === 10) {
        existingRepoInfo.shift();
      }

      await figma.clientStorage.setAsync("repoInfo", [
        ...existingRepoInfo,
        repoInfo,
      ]);
    } catch (err) {
      console.log(err);
    }
  };

  const deleteRepoInfo = async () => {
    try {
      const figmaFileName = figma.root.name;
      const existingRepoInfo: repoInfoType[] =
        (await figma.clientStorage.getAsync("repoInfo")) ?? [];

      const isFileNameExists = existingRepoInfo.some(
        (item) => item.fileName === figmaFileName
      );

      if (isFileNameExists) {
        const updatedRepoInfo = existingRepoInfo.filter(
          (item) => item.fileName !== figmaFileName
        );
        await figma.clientStorage.setAsync("repoInfo", updatedRepoInfo);
      }
    } catch (err) {
      console.log(err);
    }
  };

  return { createDeployMR };
};
