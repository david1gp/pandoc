import type { PandocConvertResponse } from "@client/pandocConvertResponseSchema"
import { pandocResponseSchema } from "@client/pandocConvertResponseSchema"
import type { PandocFromUrlQueryType } from "@client/pandocFromUrlQuerySchema"
import * as a from "valibot"
import { createError, createResult, type PromiseResult } from "~utils/result/Result"
import { resultTryParsingFetchErr } from "~utils/result/resultTryParsingFetchErr"
import { apiPathPandocFromUrl } from "./apiPathPandocFromUrl"

export async function apiPandocConvertFromUrl(
  baseUrl: string,
  body: PandocFromUrlQueryType,
): PromiseResult<PandocConvertResponse> {
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

  const contentType = response.headers.get("content-type") ?? ""
  if (contentType.includes("text/markdown")) {
    return createResult({ fileBase64: btoa(text) })
  }

  const schema = a.pipe(a.string(), a.parseJson(), pandocResponseSchema)
  const parseResult = a.safeParse(schema, text)
  if (!parseResult.success) {
    const errorMessage = a.summarize(parseResult.issues)
    return createError(op, errorMessage, text)
  }

  return createResult(parseResult.output)
}
