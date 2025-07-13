import { useEffect, useState } from "react";
import "./index.css";
import PullRequest from "./PullRequest";
import { useAppState } from "@/contexts/AppContext";
import Error from "./Error";
import { FIGMA_ACTION, FIGMA_MESSAGE } from "@/constants/figma";

type UIStateType = {
  state: "error" | "success";
  message?: React.ReactNode;
  description?: React.ReactNode;
};

const initUIState: UIStateType = {
  state: "success",
  message: "",
  description: "",
};

function App() {
  const [UIState, setUIState] = useState<UIStateType>(initUIState);
  const { dispatch } = useAppState();

  useEffect(() => {
    const messageHandler = (e: MessageEvent) => {
      const message = e.data.pluginMessage;

      if (message.type === FIGMA_MESSAGE.ERROR) {
        setUIState({
          state: "error",
          message: message.message,
          description: message.description,
        });
      }
      if (message.type === FIGMA_MESSAGE.LOAD_REPO_INFO) {
        dispatch({
          name: FIGMA_ACTION.GET_GITHUB_ACCESS_TOKEN,
          payload: { githubAccessToken: message.payload.accessToken },
        });
        dispatch({
          name: FIGMA_ACTION.GET_GITHUB_REPO_URL,
          payload: { githubRepositoryUrl: message.payload.repoUrl },
        });
        dispatch({
          name: FIGMA_ACTION.IS_REMEMBER_API_KEY,
          payload: { isRememberInfo: message.payload.accessToken !== "" },
        });
        dispatch({
          name: FIGMA_ACTION.FILE_TYPE,
          payload: { fileType: message.payload.fileType },
        });
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  return (
    <>
      {UIState.state === "error" && (
        <Error message={UIState.message} description={UIState.description} />
      )}
      {UIState.state === "success" && <PullRequest />}
    </>
  );
}

export default App;
