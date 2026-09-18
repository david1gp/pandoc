import type { Result } from "@adaptive-ds/result"
import { createResult, createResultError } from "@adaptive-ds/result"
import type { Env } from "./Env.js"

const op = "envCfb2UploadUrlResult"

export function envCfb2UploadUrlResult(env: Env | undefined): Result<string> {
  if (!env) {
    return createResultError(op, "CFB2_UPLOAD_URL is not set")
  }
  const value = env.CFB2_UPLOAD_URL
  if (!value) {
    return createResultError(op, "CFB2_UPLOAD_URL is not set")
  }
  return createResult(value)
}
