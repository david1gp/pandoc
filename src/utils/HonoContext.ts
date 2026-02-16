import type { Context } from "hono"
import type { Env } from "@/env/Env"

export type HonoContext = Context<{ Bindings: Env }>
