export type FileFormatType = "SCSS" | "TS";

// 플러그인에 사용되는 레포지토리 정보 타입
export type RepoInfoType = {
  fileName: string;
  repoUrl: string;
  accessToken: string;
  fileType: FileFormatType;
};
