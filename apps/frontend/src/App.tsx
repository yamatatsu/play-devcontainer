import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthenticationTemplate, AuthProvider, logout } from "./auth";
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
          <AuthenticationTemplate>
            <Tasks />
            <LogoutButton />
          </AuthenticationTemplate>
        </main>
      </QueryClientProvider>
    </AuthProvider>
  );
}

function LogoutButton() {
  return (
    <button type="button" onClick={logout}>
      Sign Out
    </button>
  );
}
