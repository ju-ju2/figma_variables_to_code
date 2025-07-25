import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FIGMA_ACTION, FIGMA_EVENT, FIGMA_MESSAGE } from "@/constants/figma";
import { BASE_BRANCH, COMMIT_TITLE } from "@/constants/github";
import { useAppState } from "@/contexts/AppContext";
import { Loader2Icon } from "lucide-react";
import { useEffect, useState } from "react";

const PullRequest = () => {
  const { state, dispatch } = useAppState();
  const [isLoading, setIsLoading] = useState(false);

  const handleMergeRequest = () => {
    dispatch({
      name: FIGMA_EVENT.PULL_REQUEST_STYLES,
      payload: {
        ...state,
      },
    });
  };

  useEffect(() => {
    const messageHandler = (e: MessageEvent) => {
      const message = e.data.pluginMessage;

      if (message.type === FIGMA_MESSAGE.ERROR) {
        setIsLoading(false);
      }

      if (message.type === FIGMA_MESSAGE.LOADING_START) {
        setIsLoading(true);
      }

      if (message.type === FIGMA_MESSAGE.LOADING_END) {
        setIsLoading(false);
      }
    };

    window.addEventListener("message", messageHandler);

    return () => {
      window.removeEventListener("message", messageHandler);
    };
  }, []);

  return (
    <div className="flex flex-col gap-4 p-4 h-[500px]">
      <Label htmlFor="repo">
        Github Repository URL<span className="text-red-400">*</span>
      </Label>
      <Input
        id="repo"
        placeholder="https://github.com/owner/repo"
        onChange={(e) => {
          dispatch({
            name: FIGMA_ACTION.GET_GITHUB_REPO_URL,
            payload: { githubRepoUrl: e.target.value },
          });
        }}
        value={state.githubRepoUrl}
      />
      <Label htmlFor="token">
        Github Access Token<span className="text-red-400">*</span>
      </Label>
      <Input
        id="token"
        type="password"
        autoComplete="off"
        placeholder="Github Access Token"
        onChange={(e) => {
          dispatch({
            name: FIGMA_ACTION.GET_GITHUB_ACCESS_TOKEN,
            payload: { githubAccessToken: e.target.value },
          });
        }}
        value={state.githubAccessToken}
      />
      <div className="flex flex-col gap-4">
        <Label>Type</Label>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="ts"
              checked={state.fileType === "TS"}
              onChange={() => {
                dispatch({
                  name: FIGMA_ACTION.FILE_TYPE,
                  payload: { fileType: "TS" },
                });
              }}
              className="form-radio h-4 w-4 accent-primary"
            />
            <span className="text-gray-800 text-sm">TS</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              name="type"
              value="scss"
              checked={state.fileType === "SCSS"}
              onChange={() => {
                dispatch({
                  name: FIGMA_ACTION.FILE_TYPE,
                  payload: { fileType: "SCSS" },
                });
              }}
              className="form-radio h-4 w-4 accent-primary"
            />
            <span className="text-gray-800 text-sm">SCSS</span>
          </label>
        </div>
      </div>
      <div className="flex items-center gap-2 mt-1">
        <Checkbox
          id="remember"
          checked={state.isRememberInfo}
          onCheckedChange={(checked: boolean) => {
            dispatch({
              name: FIGMA_ACTION.IS_REMEMBER_API_KEY,
              payload: { isRememberInfo: checked },
            });
          }}
        />
        <Label htmlFor="remember">Remember information</Label>
      </div>
      <hr className="border-gray-300 my-1" />
      <Label htmlFor="commit">Commit Title</Label>
      <Input
        id="commit"
        placeholder={COMMIT_TITLE}
        onChange={(e) => {
          dispatch({
            name: FIGMA_ACTION.GET_GITHUB_COMMIT_TITLE,
            payload: { commitTitle: e.target.value },
          });
        }}
      />
      <Label htmlFor="baseBranch">Base Branch</Label>
      <Input
        id="baseBranch"
        placeholder={BASE_BRANCH}
        onChange={(e) => {
          dispatch({
            name: FIGMA_ACTION.GET_GITHUB_BASE_BRANCH,
            payload: { baseBranch: e.target.value },
          });
        }}
      />
      <Button
        className="mt-auto"
        onClick={handleMergeRequest}
        disabled={!state.githubRepoUrl || !state.githubAccessToken || isLoading}
      >
        {isLoading && <Loader2Icon className="animate-spin" />}
        Pull Request
      </Button>
    </div>
  );
};

export default PullRequest;
