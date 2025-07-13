import type { FIGMA_EVENT } from "@/constants/figma";
import { emit as e, on as o } from "@create-figma-plugin/utilities";

export type GithubPayload = GetGithubRepoUrlPayload &
  GetGithubAccessTokenPayload &
  GetStylesPayload &
  GetCommitTitlePayload &
  GetBaseBranchPayload &
  IsRememberInfoPayload &
  FileType;

export interface GetGithubRepoUrlPayload {
  githubRepositoryUrl: string;
}

export interface GetGithubAccessTokenPayload {
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

export interface GetStylesPayload {
  styles: StylesType;
}

interface GetCommitTitlePayload {
  commitTitle: string;
}

interface GetBaseBranchPayload {
  baseBranch: string;
}

interface IsRememberInfoPayload {
  isRememberInfo?: boolean;
}

interface FileType {
  fileType: "TS" | "SCSS";
}

export type Events = {
  PULL_REQUEST_STYLES: {
    name: typeof FIGMA_EVENT.PULL_REQUEST_STYLES;
    payload: GithubPayload;
    handler: (props: GithubPayload) => void;
  };

  GET_STYLES_PREVIEW: {
    name: typeof FIGMA_EVENT.GET_STYLES_PREVIEW;
    payload: GetStylesPayload;
    handler: (props: GetStylesPayload) => void;
  };
};

type EventName = keyof Events;

export const emit = <T extends EventName>(
  name: T,
  payload: Events[T]["payload"]
) => {
  return e(name, payload);
};

export const on = <T extends keyof Events>(
  name: T,
  handler: Events[T]["handler"]
) => {
  if (handler) return o(name, handler);
};
