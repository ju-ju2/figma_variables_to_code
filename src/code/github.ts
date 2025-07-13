import { FIGMA_STORAGE } from "@/constants/figma";
import type { ActionsType, StylesType } from "../common/fromPlugin";
import { TARGET_BRANCH, COMMIT_TITLE, BASE_BRANCH } from "../constants/github";
import { getStyles } from "./styles";

export type RepoInfoType = {
  fileName: string;
  repoUrl: string;
  accessToken: string;
  fileType: "TS" | "SCSS";
};

export const commitMultipleFilesToGithub = async (
  repoUrl: string,
  token: string,
  commitMessage: string,
  styles: StylesType,
  baseBranch: string,
  fileType: "TS" | "SCSS",
  isRememberInfo?: boolean
) => {
  getStyles(fileType);
  const GITHUB_API = "https://api.github.com";
  const [owner, repo] = repoUrl.split("/").slice(-2);

  try {
    // ✅ Step 1: 기준 브랜치 (dev)의 SHA 가져오기
    const baseRefRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${
        baseBranch || BASE_BRANCH
      }`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!baseRefRes.ok) throw new Error("❌ 기준 브랜치 정보 조회 실패");

    const baseRefData = await baseRefRes.json();
    const baseCommitSha = baseRefData.object.sha;
    console.log("✅ 기준 브랜치 SHA:", baseCommitSha);

    // ✅ Step 2: 대상 브랜치(BRANCH_NAME) 존재 여부 확인 및 없으면 생성
    const targetRefRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${TARGET_BRANCH}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!targetRefRes.ok) {
      // 브랜치가 없으면 생성
      const createBranchRes = await fetch(
        `${GITHUB_API}/repos/${owner}/${repo}/git/refs`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            ref: `refs/heads/${TARGET_BRANCH}`,
            sha: baseCommitSha,
          }),
        }
      );
      if (!createBranchRes.ok) {
        const err = await createBranchRes.json();
        throw new Error("❌ 새 브랜치 생성 실패: " + JSON.stringify(err));
      }
      console.log("✅ 새 브랜치 생성 완료:", TARGET_BRANCH);
    } else {
      console.log("⚠️ 브랜치 이미 존재함:", TARGET_BRANCH);
    }

    // ✅ Step 3: 새 브랜치의 최신 커밋 SHA 조회
    const refRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/ref/heads/${TARGET_BRANCH}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    if (!refRes.ok) throw new Error("❌ 대상 브랜치 SHA 조회 실패");

    const refData = await refRes.json();
    const latestCommitSha = refData.object.sha;
    console.log("🔍 대상 브랜치 최신 커밋 SHA:", latestCommitSha);

    // ✅ Step 4: 커밋에서 tree SHA 추출
    const commitRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/commits/${latestCommitSha}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const commitData = await commitRes.json();
    const baseTreeSha = commitData.tree.sha;
    console.log("✅ 트리 SHA:", baseTreeSha);

    // ✅ Step 5: 새로운 트리 생성
    const files: ActionsType[] = [styles.localStyles, ...styles.variables];
    const tree = files.map((file) => ({
      path: file.file_path,
      mode: "100644",
      type: "blob",
      content: file.content,
    }));

    const treeRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/trees`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          base_tree: baseTreeSha,
          tree,
        }),
      }
    );
    if (!treeRes.ok) throw new Error("❌ 트리 생성 실패");

    const treeData = await treeRes.json();
    const newTreeSha = treeData.sha;
    console.log("✅ 트리 생성 완료:", newTreeSha);

    // ✅ Step 6: 커밋 생성
    const commitCreateRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/commits`,
      {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          message: commitMessage || COMMIT_TITLE,
          tree: newTreeSha,
          parents: [latestCommitSha],
        }),
      }
    );
    if (!commitCreateRes.ok) throw new Error("❌ 커밋 생성 실패");

    const newCommit = await commitCreateRes.json();
    const newCommitSha = newCommit.sha;
    console.log("✅ 커밋 생성 완료:", newCommitSha);

    // ✅ Step 7: 브랜치 HEAD 업데이트
    const updateRes = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/git/refs/heads/${TARGET_BRANCH}`,
      {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ sha: newCommitSha }),
      }
    );
    if (!updateRes.ok) throw new Error("❌ 브랜치 HEAD 업데이트 실패");

    console.log("✅ 브랜치 HEAD 업데이트 완료");

    // ✅ Step 8: 저장 로직 유지
    const setRepoInfo = async () => {
      try {
        const existing: RepoInfoType[] =
          (await figma.clientStorage.getAsync(FIGMA_STORAGE.REPO_INFO)) ?? [];

        const updated = existing.filter(
          (item) => item.fileName !== figma.root.name
        );
        updated.push({
          fileName: figma.root.name,
          repoUrl,
          accessToken: token,
          fileType,
        });

        if (updated.length > 10) updated.shift();
        await figma.clientStorage.setAsync(FIGMA_STORAGE.REPO_INFO, updated);
      } catch (err) {
        console.log("⚠️ setRepoInfo Error:", err);
      }
    };

    const deleteRepoInfo = async () => {
      try {
        const existing: RepoInfoType[] =
          (await figma.clientStorage.getAsync(FIGMA_STORAGE.REPO_INFO)) ?? [];

        const updated = existing.filter((item) => {
          return item.fileName !== figma.root.name;
        });
        await figma.clientStorage.setAsync(FIGMA_STORAGE.REPO_INFO, updated);
      } catch (err) {
        console.log("⚠️ deleteRepoInfo Error:", err);
      }
    };

    if (isRememberInfo) {
      await setRepoInfo();
    } else {
      await deleteRepoInfo();
    }

    return { success: true, commitSha: newCommitSha };
  } catch (err) {
    console.error("🔥 에러 발생:", err);
    return { success: false, error: err };
  }
};
