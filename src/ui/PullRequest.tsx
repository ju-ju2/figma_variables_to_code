import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const PullRequest = () => {
  return (
    <div className="flex flex-col gap-4 p-4">
      <Label htmlFor="repo">
        Github Repository URL<span className="text-red-400">*</span>
      </Label>
      <Input id="repo" placeholder="https://github.com/owner/repo" />
      <Label htmlFor="email">
        Github Access Token<span className="text-red-400">*</span>
      </Label>
      <Input id="email" placeholder="Github Access Token" />
      <div className="flex items-center gap-2">
        <Checkbox id="remember" />
        <Label htmlFor="remember">Remember information</Label>
      </div>
      <Label htmlFor="commit">Commit Title</Label>
      <Input id="commit" placeholder="feat: token update" />
      <Button>Pull Request</Button>
    </div>
  );
};

export default PullRequest;
