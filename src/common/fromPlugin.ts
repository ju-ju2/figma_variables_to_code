import { emit as e, on as o } from '@create-figma-plugin/utilities';

type GitlabPayload = GetGitlabRepoUrlPayload &
  GetGitlabAccessTokenPayload &
  GetScssPayload &
  GetCommitTitlePayload &
  IsRememberInfoPayload;

export interface GetGitlabRepoUrlPayload {
  gitlabRepositoryUrl: string;
}

export interface GetGitlabAccessTokenPayload {
  gitlabAccessToken: string;
}

export interface ActionsType {
  action: string;
  file_path: string;
  content: string;
}

export interface ScssType {
  localStyles: ActionsType;
  variables: ActionsType[];
}

export interface GetScssPayload {
  scss: ScssType;
}

interface GetCommitTitlePayload {
  commitTitle: string;
}

interface IsRememberInfoPayload {
  isRememberInfo?: boolean;
}

export type Events = {
  MERGE_REQUEST_SCSS: {
    name: 'MERGE_REQUEST_SCSS';
    payload: GitlabPayload;
    handler: (props: GitlabPayload) => void;
  };

  GET_SCSS_PREVIEW: {
    name: 'GET_SCSS_PREVIEW';
    payload: GetScssPayload;
    handler: (props: GetScssPayload) => void;
  };
};

type EventName = keyof Events;

export const emit = <T extends EventName>(
  name: T,
  payload: Events[T]['payload']
) => {
  return e(name, payload);
};

export const on = <T extends keyof Events>(
  name: T,
  handler: Events[T]['handler']
) => {
  if (handler) return o(name, handler);
};
