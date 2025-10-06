import { cors as _cors } from "hono/cors";

export const cors = _cors({ origin: "http://localhost:5173" });
