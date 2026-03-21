import type { Context } from "hono"
import type { Env } from "../env/Env.js"

export type HonoContext = Context<{ Bindings: Env }>
