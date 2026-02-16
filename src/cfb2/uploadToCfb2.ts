import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"
import { envCfb2UploadUrlResult } from "@/env/envTokenSecretResult"
import type { Env } from "@/env/Env"
import { readFile } from "node:fs/promises"
import { basename } from "node:path"

const op = "uploadToCfb2"

export async function uploadToCfb2(env: Env, filePath: string, format: string): PromiseResult<string> {
  const cfb2UrlResult = envCfb2UploadUrlResult(env)
  if (!cfb2UrlResult.success) {
    return cfb2UrlResult
  }

  try {
    const fileContent = await readFile(filePath)
    const fileName = basename(filePath)

    const contentType = getContentType(format)

    const response = await fetch(cfb2UrlResult.data, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        "x-file-name": fileName,
      },
      body: fileContent,
    })

    if (!response.ok) {
      const errorText = await response.text()
      return createResultError(op, `Upload failed: ${response.status} ${response.statusText} - ${errorText}`)
    }

    const result = await response.json() as { url?: string }
    if (!result.url) {
      return createResultError(op, "Upload response missing url")
    }
    const url = result.url

    return createResult(url)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return createResultError(op, message)
  }
}

function getContentType(format: string): string {
  const mimeTypes: Record<string, string> = {
    pdf: "application/pdf",
    docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    html: "text/html",
    markdown: "text/markdown",
    md: "text/markdown",
    tex: "application/x-tex",
    latex: "application/x-latex",
    odt: "application/vnd.oasis.opendocument.text",
    epub: "application/epub+zip",
    rtf: "application/rtf",
    txt: "text/plain",
  }

  return mimeTypes[format] ?? "application/octet-stream"
}
