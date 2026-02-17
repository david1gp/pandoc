import type { PandocFromUrlQueryType } from "@client/pandocFromUrlQuerySchema"
import { pandocFormatIsText } from "@client/pandocFormatsText"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"
import { apiPathPandocFromUrl } from "./apiPathPandocFromUrl"

export async function apiPandocConvertFromUrl(
  body: PandocFromUrlQueryType,
  baseUrl: string,
): PromiseResult<string> {
  const op = "apiPandocConvertFromUrl"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }

  const url = new URL(apiPathPandocFromUrl, baseUrl)

  const bodyJson = JSON.stringify(body)

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

  if (pandocFormatIsText(body.outputFormat)) {
    return createResult(text)
  }

  const binaryData = Uint8Array.from(atob(text), (c) => c.charCodeAt(0))
  const decoder = new TextDecoder("utf-8", { fatal: false })
  return createResult(decoder.decode(binaryData))
}
