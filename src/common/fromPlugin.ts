import type { FIGMA_EVENT } from "@/constants/figma";
import type { GithubPayload, StylesPayload } from "@/types/plugin";
import { emit as e, on as o } from "@create-figma-plugin/utilities";

export type Events = {
  PULL_REQUEST_STYLES: {
    name: typeof FIGMA_EVENT.PULL_REQUEST_STYLES;
    payload: GithubPayload;
    handler: (props: GithubPayload) => void;
  };

  GET_STYLES_PREVIEW: {
    name: typeof FIGMA_EVENT.GET_STYLES_PREVIEW;
    payload: StylesPayload;
    handler: (props: StylesPayload) => void;
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
