import type { app } from "@apps/backend";
import { hc } from "hono/client";
import { acquireToken } from "../auth";

export const client = hc<typeof app>("http://localhost:3000/", {
  /**
   * Override fetch function to attach Authorization header
   * @see https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/0dae241844c3f0f984b4569da21face7ca76cca7/lib/msal-browser/docs/acquire-token.md#using-the-access-token
   */
  fetch: async (input: RequestInfo | URL, requestInit?: RequestInit) => {
    const token = await acquireToken();
    const headers = _getHeaders(input, requestInit);
    headers.set("Authorization", `Bearer ${token}`);

    return fetch(input, { ...requestInit, headers });
  },
});

const _getHeaders = (input: RequestInfo | URL, requestInit?: RequestInit) => {
  if (input instanceof Request) {
    return input.headers;
  }
  return new Headers(requestInit?.headers);
};
