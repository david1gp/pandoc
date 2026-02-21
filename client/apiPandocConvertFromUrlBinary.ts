import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { apiPathPandocFromUrl } from "./apiPathPandocFromUrl"
import type { PandocFromUrlBinaryQueryType } from "./pandocFromUrlBinaryQuerySchema"

export async function apiPandocConvertFromUrlBinary(
  args: PandocFromUrlBinaryQueryType,
  baseUrl: string,
): PromiseResult<Blob> {
  const op = "apiPandocConvertFromUrlBinary"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }

  const url = new URL(apiPathPandocFromUrl, baseUrl)

  const bodyJson = JSON.stringify(args)

  const response = await fetch(url.toString(), {
    method: "POST",
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
