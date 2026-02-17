import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"
import { apiPathPandocFromFile } from "./apiPathPandocFromFile"
import type { PandocFromFileBinaryBodyType } from "./pandocFromFileBinaryBodySchema"

export async function apiPandocConvertFromFileBinary(
  args: PandocFromFileBinaryBodyType,
  baseUrl: string,
): PromiseResult<Uint8Array<ArrayBuffer>> {
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

  const text = await response.text()
  if (!response.ok) {
    return resultTryParsingFetchErr(op, text, response.status, response.statusText)
  }

  const binaryData = Uint8Array.from(atob(text), (c) => c.charCodeAt(0))
  return createResult(binaryData)
}
