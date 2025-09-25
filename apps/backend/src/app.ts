import { Hono } from "hono";
import rootRoutes from "./routes/root";

export const app = new Hono().route("/", rootRoutes);
