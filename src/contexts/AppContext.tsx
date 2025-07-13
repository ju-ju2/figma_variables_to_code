import React, {
  createContext,
  useContext,
  useReducer,
  type Dispatch,
} from "react";
import {
  emit,
  type ActionsType,
  type Events,
  type GithubPayload,
} from "../common/fromPlugin";
import { FIGMA_ACTION, FIGMA_EVENT } from "@/constants/figma";

type Action =
  | {
      name: typeof FIGMA_ACTION.GET_GITHUB_REPO_URL;
      payload: { githubRepositoryUrl: string };
    }
  | {
      name: typeof FIGMA_ACTION.GET_GITHUB_ACCESS_TOKEN;
      payload: { githubAccessToken: string };
    }
  | Omit<Events[typeof FIGMA_EVENT.PULL_REQUEST_STYLES], "handler">
  | Omit<Events[typeof FIGMA_EVENT.GET_STYLES_PREVIEW], "handler">
  | {
      name: typeof FIGMA_ACTION.GET_GITHUB_COMMIT_TITLE;
      payload: { commitTitle: string };
    }
  | {
      name: typeof FIGMA_ACTION.GET_GITHUB_BASE_BRANCH;
      payload: { baseBranch: string };
    }
  | {
      name: typeof FIGMA_ACTION.IS_REMEMBER_API_KEY;
      payload: { isRememberInfo: boolean };
    }
  | {
      name: typeof FIGMA_ACTION.FILE_TYPE;
      payload: { fileType: "TS" | "SCSS" };
    };

interface AppContextProps {
  state: GithubPayload;
  dispatch: Dispatch<Action>;
}

const initStyles: ActionsType = {
  action: "",
  file_path: "",
  content: "",
};

// 초기 상태
const initialState: GithubPayload = {
  githubRepositoryUrl: "",
  githubAccessToken: "",
  styles: {
    localStyles: initStyles,
    variables: [initStyles],
  },
  commitTitle: "",
  baseBranch: "",
  isRememberInfo: false,
  fileType: "TS", // 기본값 설정
};

// 리듀서 함수
function reducer(state: GithubPayload, action: Action) {
  switch (action.name) {
    case FIGMA_ACTION.GET_GITHUB_REPO_URL:
      return {
        ...state,
        githubRepositoryUrl: action.payload.githubRepositoryUrl,
      };
    case FIGMA_ACTION.GET_GITHUB_ACCESS_TOKEN:
      return {
        ...state,
        githubAccessToken: action.payload.githubAccessToken,
      };
    case FIGMA_EVENT.PULL_REQUEST_STYLES:
      emit(FIGMA_EVENT.PULL_REQUEST_STYLES, {
        ...action.payload,
        styles: state.styles,
      });
      return {
        ...state,
      };
    case FIGMA_EVENT.GET_STYLES_PREVIEW:
      return {
        ...state,
        styles: action.payload.styles,
      };
    case FIGMA_ACTION.GET_GITHUB_COMMIT_TITLE:
      return {
        ...state,
        commitTitle: action.payload.commitTitle,
      };
    case FIGMA_ACTION.GET_GITHUB_BASE_BRANCH:
      return {
        ...state,
        baseBranch: action.payload.baseBranch,
      };
    case FIGMA_ACTION.IS_REMEMBER_API_KEY:
      return {
        ...state,
        isRememberInfo: action.payload.isRememberInfo,
      };
    case FIGMA_ACTION.FILE_TYPE:
      return {
        ...state,
        fileType: action.payload.fileType,
      };
    default:
      throw new Error();
  }
}

// 컨텍스트 생성
const AppContext = createContext<AppContextProps | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  window.onmessage = (event) => {
    // 미리 plugin에서 받아놔야하는 코드를 AppContext에 넣어두는 과정
    if (typeof event.data.pluginMessage === "undefined") {
      console.warn("not plugin message");
      return;
    }

    const args = event.data.pluginMessage;
    if (!Array.isArray(args)) {
      return;
    }

    const [name, payload] = event.data.pluginMessage;
    if (typeof name !== "string") {
      return;
    }

    dispatch({ name: name as Action["name"], payload });
  };

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppState() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useCount must be used within a CountProvider");
  }
  return context;
}
