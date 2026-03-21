import { createError, createResult, type PromiseResult } from "@adaptive-ds/result"
import { resultTryParsingFetchErr } from "@adaptive-ds/result/resultTryParsingFetchErr.js"
import { apiPathPandocFromFile } from "./apiPathPandocFromFile.js"
import type { PandocFromFileTextBodyType } from "./pandocFromFileTextBodySchema.js"

export async function apiPandocConvertFromFileText(
  args: PandocFromFileTextBodyType,
  baseUrl: string,
): PromiseResult<string> {
  const op = "apiPandocConvertFromFileText"

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

  const text = await response.text()
  if (!response.ok) {
    return resultTryParsingFetchErr(op, text, response.status, response.statusText)
  }

  return createResult(text)
}
