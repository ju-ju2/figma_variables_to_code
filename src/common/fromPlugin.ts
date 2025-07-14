import type { FIGMA_EVENT } from "@/constants/figma";
import type { GithubPayload } from "@/types/plugin";
import { emit as e, on as o } from "@create-figma-plugin/utilities";

export type Events = {
  PULL_REQUEST_STYLES: {
    name: typeof FIGMA_EVENT.PULL_REQUEST_STYLES;
    payload: GithubPayload;
    handler: (props: GithubPayload) => void;
  };
};

type EventName = keyof Events;

export const emit = <T extends EventName>(
  name: T,
  payload: Events[T]["payload"]
) => {
  return e(name, payload);
};

export const on = <T extends EventName>(
  name: T,
  handler: Events[T]["handler"]
) => {
  if (handler) return o(name, handler);
};
