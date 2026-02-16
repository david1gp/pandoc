import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

export async function downloadFileFromUrl(url: string): PromiseResult<{ content: Uint8Array; fileName: string }> {
  const op = "downloadFileFromUrl"
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
