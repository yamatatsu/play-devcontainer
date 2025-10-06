import { InteractionType } from "@azure/msal-browser";
import {
  type MsalAuthenticationResult,
  MsalAuthenticationTemplate,
} from "@azure/msal-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, logout } from "./auth";
import Tasks from "./Tasks";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      /**
       * prevent automatic refetching
       * @see https://tanstack.com/query/latest/docs/framework/react/guides/important-defaults
       */
      staleTime: Number.POSITIVE_INFINITY,
    },
  },
});

export default function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClient}>
        <main>
          <MsalAuthenticationTemplate
            interactionType={InteractionType.Redirect}
            authenticationRequest={{
              scopes: [
                "openid",
                "profile",
                "email",
                "api://694b37ed-46b7-422a-aacb-c3ce12277475/All.All",
              ],
            }}
            errorComponent={ErrorComponent}
            loadingComponent={LoadingComponent}
          >
            <Tasks />
            <LogoutButton />
          </MsalAuthenticationTemplate>
        </main>
      </QueryClientProvider>
    </AuthProvider>
  );
}

function ErrorComponent({ error }: MsalAuthenticationResult) {
  return <p>An Error Occurred: {error?.errorMessage}</p>;
}

function LoadingComponent() {
  return <p>Authentication in progress...</p>;
}

function LogoutButton() {
  return (
    <button type="button" onClick={logout}>
      Sign Out
    </button>
  );
}
