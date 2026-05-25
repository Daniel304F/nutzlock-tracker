import { AppProviders } from "@components/AppProviders";
import { HomePage } from "@pages/HomePage";
import { LandingPage } from "@pages/LandingPage";

const workspacePath = "/workspace";

function isWorkspacePath(pathname: string) {
  return pathname === workspacePath || pathname === `${workspacePath}/`;
}

function App() {
  const pathname = window.location.pathname;

  return (
    <AppProviders>
      {isWorkspacePath(pathname) ? <HomePage /> : <LandingPage workspaceHref={workspacePath} />}
    </AppProviders>
  );
}

export default App;
