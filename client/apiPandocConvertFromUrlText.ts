import { createError, createResult, type PromiseResult } from "@adaptive-ds/result"
import { resultTryParsingFetchErr } from "@adaptive-ds/result/resultTryParsingFetchErr.js"
import { apiPathPandocFromUrl } from "./apiPathPandocFromUrl.js"
import type { PandocFromUrlTextQueryType } from "./pandocFromUrlTextQuerySchema.js"

export async function apiPandocConvertFromUrlText(
  args: PandocFromUrlTextQueryType,
  baseUrl: string,
): PromiseResult<string> {
  const op = "apiPandocConvertFromUrlText"

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

  const text = await response.text()
  if (!response.ok) {
    return resultTryParsingFetchErr(op, text, response.status, response.statusText)
  }

  return createResult(text)
}
