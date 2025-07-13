import type { FileFormatType } from "./code";

export type GithubPayload = GithubRepoUrlPayload &
  GithubAccessTokenPayload &
  CommitTitlePayload &
  BaseBranchPayload &
  IsRememberInfoPayload &
  FileType;

export interface GithubRepoUrlPayload {
  githubRepoUrl: string;
}

export interface GithubAccessTokenPayload {
  githubAccessToken: string;
}

export interface ActionsType {
  action: string;
  file_path: string;
  content: string;
}

export interface StylesType {
  localStyles: ActionsType;
  variables: ActionsType[];
}

interface CommitTitlePayload {
  commitTitle: string;
}

interface BaseBranchPayload {
  baseBranch: string;
}

interface IsRememberInfoPayload {
  isRememberInfo?: boolean;
}

interface FileType {
  fileType: FileFormatType;
}
