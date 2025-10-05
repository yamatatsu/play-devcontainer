import {
  InteractionRequiredAuthError,
  PublicClientApplication,
  type RedirectRequest,
  type SilentRequest,
} from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";

/**
 * singleton
 */
const pca = new PublicClientApplication({
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID,
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID}`,
    redirectUri: "http://localhost:5173",
  },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <MsalProvider instance={pca}>{children}</MsalProvider>;
}

export const logout = async () => {
  await pca.logoutRedirect({
    // TODO: This is not working... We need to redirect to current page after logout.
    postLogoutRedirectUri: "http://localhost:5173",
  });
};

/**
 * @see https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/0dae241844c3f0f984b4569da21face7ca76cca7/lib/msal-browser/docs/acquire-token.md#redirect
 */
export const acquireToken = async (): Promise<string> => {
  const accounts = pca.getAllAccounts();
  const request = {
    scopes: ["openid", "profile"],
    account: accounts[0],
  } satisfies Pick<
    SilentRequest,
    Extract<keyof SilentRequest, keyof RedirectRequest>
  >;

  try {
    const res = await pca.acquireTokenSilent(request);
    return res.accessToken;
  } catch (error) {
    if (error instanceof InteractionRequiredAuthError) {
      // fallback to interaction when silent call fails
      await pca.acquireTokenRedirect(request);
    }
    throw error;
  }
};
