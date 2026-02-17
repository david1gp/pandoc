import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"
import { apiPathPandocFromFile } from "./apiPathPandocFromFile"
import type { PandocFromFileTextBodyType } from "./pandocFromFileTextBodySchema"

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
