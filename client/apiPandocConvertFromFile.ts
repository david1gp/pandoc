import type { PandocFromFileBodyType } from "@client/pandocFromFileBodySchema"
import { pandocFormatIsText } from "@client/pandocFormatsText"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"
import { apiPathPandocFromFile } from "./apiPathPandocFromFile"

export async function apiPandocConvertFromFile(
  body: PandocFromFileBodyType,
  baseUrl: string,
): PromiseResult<string> {
  const op = "apiPandocConvertFromFile"

  if (!baseUrl) {
    return createError(op, "baseUrl is required")
  }

  const url = new URL(apiPathPandocFromFile, baseUrl)

  const bodyJson = JSON.stringify(body)

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

  if (pandocFormatIsText(body.outputFormat)) {
    return createResult(text)
  }

  const binaryData = Uint8Array.from(atob(text), (c) => c.charCodeAt(0))
  const decoder = new TextDecoder("utf-8", { fatal: false })
  return createResult(decoder.decode(binaryData))
}
