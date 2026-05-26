import { AppProviders } from "@components/AppProviders";
import { HomePage } from "@pages/HomePage";
import { LandingPage } from "@pages/LandingPage";
import { RunDetailPage } from "@pages/RunDetailPage";

const workspacePath = "/workspace";
const runDetailPattern = /^\/workspace\/runs\/([^/]+)\/?$/;

function isWorkspacePath(pathname: string) {
  return pathname === workspacePath || pathname === `${workspacePath}/`;
}

function getRunDetailId(pathname: string) {
  const match = runDetailPattern.exec(pathname);
  return match?.[1] ? decodeURIComponent(match[1]) : null;
}

function App() {
  const pathname = window.location.pathname;
  const runDetailId = getRunDetailId(pathname);

  return (
    <AppProviders>
      {runDetailId ? (
        <RunDetailPage runId={runDetailId} />
      ) : isWorkspacePath(pathname) ? (
        <HomePage />
      ) : (
        <LandingPage workspaceHref={workspacePath} />
      )}
    </AppProviders>
  );
}

export default App;
