import logger from "@packages/logger";
import { bearerAuth as _bearerAuth } from "hono/bearer-auth";
import { createRemoteJWKSet, errors, jwtVerify } from "jose";
import { type JwtPayload, jwtPayloadSchema } from "../domain/model/user";

const ENTRA_TENANT_NAME = process.env.ENTRA_TENANT_NAME;
const ENTRA_TENANT_ID = process.env.ENTRA_TENANT_ID;
const ENTRA_CLIENT_ID = process.env.ENTRA_CLIENT_ID;
const JWKS_URI = `https://${ENTRA_TENANT_NAME}.ciamlogin.com/${ENTRA_TENANT_ID}/discovery/v2.0/keys`;

// Create a remote JWKS - this fetches and caches the public keys
const JWKS = createRemoteJWKSet(new URL(JWKS_URI));

const verifyToken = (token: string) => {
  return jwtVerify(
    token,
    JWKS,
    /**
     * Microsoft requires to verify these claims.
     * @see https://learn.microsoft.com/en-us/entra/identity-platform/access-tokens
     */
    {
      issuer: `https://login.microsoftonline.com/${ENTRA_TENANT_ID}/v2.0`,
      audience: ENTRA_CLIENT_ID,
      algorithms: ["RS256"],
    },
  );
};

declare module "hono" {
  /**
   * extend hono context to set and get JWT payload
   * @see https://hono.dev/docs/api/context#set-get
   * @see https://hono.dev/docs/api/context#contextvariablemap
   */
  interface ContextVariableMap {
    jwtPayload: JwtPayload;
  }
}

/**
 * a hono middleware to verify the Bearer token in the Authentication header
 * @see https://hono.dev/docs/middleware/builtin/bearer-auth
 */
export const bearerAuth = _bearerAuth({
  verifyToken: async (token, c) => {
    try {
      const { payload } = await verifyToken(token);

      // TODO: filter sensitive data such as email and phone number
      logger.info({ payload }, "[JWT] Valid Token");

      const result = jwtPayloadSchema.safeParse(payload);
      if (!result.success) {
        logger.error(result.error, "[JWT] Invalid Payload");
        return false;
      }

      logger.info({ payload }, "[JWT] Valid Payload");

      c.set("jwtPayload", result.data);

      return true;
    } catch (err) {
      if (err instanceof errors.JWTClaimValidationFailed) {
        logger.info(err, "[JWT] Invalid Claim");
      } else {
        logger.error(err, "[JWT] Invalid Token");
      }

      return false;
    }
  },
  noAuthenticationHeaderMessage: () => {
    logger.info("No authentication header");
    return { code: "authorization_failed", message: "Unauthorized" };
  },
  invalidAuthenticationHeaderMessage: () => {
    logger.info("Invalid authentication header");
    return { code: "authorization_failed", message: "Unauthorized" };
  },
  invalidTokenMessage: () => {
    logger.info("Invalid token");
    return { code: "authorization_failed", message: "Unauthorized" };
  },
});
