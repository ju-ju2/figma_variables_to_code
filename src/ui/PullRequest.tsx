import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAppState } from "@/contexts/AppContext";

const PullRequest = () => {
  const { state, dispatch } = useAppState();

  const handleMergeRequest = () => {
    dispatch({
      name: "PULL_REQUEST_SCSS",
      payload: {
        ...state,
        githubRepositoryUrl: state.githubRepositoryUrl,
      },
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      <Label htmlFor="repo">
        Github Repository URL<span className="text-red-400">*</span>
      </Label>
      <Input
        id="repo"
        placeholder="https://github.com/owner/repo"
        onChange={(e) => {
          dispatch({
            name: "GET_GITHUB_REPO_URL",
            payload: { githubRepositoryUrl: e.target.value },
          });
        }}
      />
      <Label htmlFor="email">
        Github Access Token<span className="text-red-400">*</span>
      </Label>
      <Input
        id="email"
        placeholder="Github Access Token"
        onChange={(e) => {
          dispatch({
            name: "GET_GITHUB_ACCESS_TOKEN",
            payload: { githubAccessToken: e.target.value },
          });
        }}
      />
      <div className="flex items-center gap-2">
        <Checkbox
          id="remember"
          checked={state.isRememberInfo}
          onCheckedChange={(checked: boolean) => {
            dispatch({
              name: "IS_REMEMBER_API_KEY",
              payload: { isRememberInfo: checked },
            });
          }}
        />
        <Label htmlFor="remember">Remember information</Label>
      </div>
      <Label htmlFor="commit">Commit Title</Label>
      <Input
        id="commit"
        placeholder="feat: token update"
        onChange={(e) => {
          dispatch({
            name: "GET_GITHUB_COMMIT_TITLE",
            payload: { commitTitle: e.target.value },
          });
        }}
      />
      <Button
        onClick={handleMergeRequest}
        disabled={!state.githubRepositoryUrl || !state.githubAccessToken}
      >
        Pull Request
      </Button>
    </div>
  );
};

export default PullRequest;
