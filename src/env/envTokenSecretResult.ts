import type { Result } from "~utils/result/Result"
import { createResult, createResultError } from "~utils/result/Result"
import type { Env } from "@/env/Env"

const op = "envTokenSecretResult"

export function envTokenSecretResult(env: Env | undefined): Result<string> {
  if (!env) {
    return createResultError(op, "TOKEN_SECRET is not set")
  }
  const value = env.TOKEN_SECRET
  if (!value) {
    return createResultError(op, "TOKEN_SECRET is not set")
  }
  return createResult(value)
}

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
