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
  type ScssType,
} from "../common/fromPlugin";

type State = {
  gitlabRepositoryUrl: string;
  gitlabAccessToken: string;
  scss: ScssType;
  commitTitle: string;
  isRememberInfo?: boolean;
};

type Action =
  | { name: "GET_GITLAB_REPO_URL"; payload: { gitlabRepositoryUrl: string } }
  | {
      name: "GET_GITLAB_ACCESS_TOKEN";
      payload: { gitlabAccessToken: string };
    }
  | Omit<Events["MERGE_REQUEST_SCSS"], "handler">
  | Omit<Events["GET_SCSS_PREVIEW"], "handler">
  | {
      name: "GET_GITLAB_COMMIT_TITLE";
      payload: { commitTitle: string };
    }
  | {
      name: "IS_REMEMBER_API_KEY";
      payload: { isRememberInfo: boolean };
    };

interface AppContextProps {
  state: State;
  dispatch: Dispatch<Action>;
}

const initScss: ActionsType = {
  action: "",
  file_path: "",
  content: "",
};

// 초기 상태
const initialState: State = {
  gitlabRepositoryUrl: "",
  gitlabAccessToken: "",
  scss: {
    localStyles: initScss,
    variables: [initScss],
  },
  commitTitle: "",
  isRememberInfo: false,
};

// 리듀서 함수
function reducer(state: State, action: Action) {
  switch (action.name) {
    case "GET_GITLAB_REPO_URL":
      return {
        ...state,
        gitlabRepositoryUrl: action.payload.gitlabRepositoryUrl,
      };
    case "GET_GITLAB_ACCESS_TOKEN":
      return {
        ...state,
        gitlabAccessToken: action.payload.gitlabAccessToken,
      };
    case "MERGE_REQUEST_SCSS":
      emit("MERGE_REQUEST_SCSS", { ...action.payload, scss: state.scss });
      return {
        ...state,
      };
    case "GET_SCSS_PREVIEW":
      return {
        ...state,
        scss: action.payload.scss,
      };
    case "GET_GITLAB_COMMIT_TITLE":
      return {
        ...state,
        commitTitle: action.payload.commitTitle,
      };
    case "IS_REMEMBER_API_KEY":
      return {
        ...state,
        isRememberInfo: action.payload.isRememberInfo,
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
