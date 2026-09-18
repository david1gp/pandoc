import { createResult, createResultError, type PromiseResult } from "@adaptive-ds/result"

export async function fileFromUrlDownload(url: string): PromiseResult<{ content: Uint8Array; fileName: string }> {
  const op = "fileFromUrlDownload"
  try {
    const response = await fetch(url)
    if (!response.ok) {
      return createResultError(op, `Failed to download file: ${response.status} ${response.statusText}`)
    }

    const arrayBuffer = await response.arrayBuffer()
    const content = new Uint8Array(arrayBuffer)

    const urlObj = new URL(url)
    const fileName = urlObj.pathname.split("/").pop() ?? "downloaded-file"

    return createResult({ content, fileName })
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return createResultError(op, message)
  }
}
