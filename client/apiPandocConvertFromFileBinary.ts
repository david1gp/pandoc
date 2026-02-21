import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { apiPathPandocFromFile } from "./apiPathPandocFromFile"
import type { PandocFromFileBinaryBodyType } from "./pandocFromFileBinaryBodySchema"

export async function apiPandocConvertFromFileBinary(
  args: PandocFromFileBinaryBodyType,
  baseUrl: string,
): PromiseResult<Blob> {
  const op = "apiPandocConvertFromFileBinary"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }

  const url = new URL(apiPathPandocFromFile, baseUrl)

  const bodyJson = JSON.stringify(args)

  const response = await fetch(url.toString(), {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: bodyJson,
  })

  const blob = await response.blob()
  if (!response.ok) {
    return createError(op, response.statusText, String(response.status))
  }

  return createResult(blob)
}
