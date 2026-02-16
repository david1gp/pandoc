import type { HonoContext } from "@/utils/HonoContext"
import { createResultError, type Result, type PromiseResult } from "~utils/result/Result"
import * as v from "valibot"
import { inputSchema, type InputSchema } from "@/schema/pandocSchema"
import { isPandocOutputFormat } from "@/utils/pandocFormats"
import { verifyToken } from "@/auth/verifyToken"
import { envTokenSecretResult } from "@/env/envTokenSecretResult"
import { downloadFileFromUrl } from "@/utils/downloadFileFromUrl"
import { convertWithPandoc } from "@/pandoc/convertWithPandoc"
import { uploadToCfb2 } from "@/cfb2/uploadToCfb2"
import { writeFile, unlink } from "node:fs/promises"
import { randomUUID } from "node:crypto"

const op = "pandocHandler"

export async function pandocHandler(c: HonoContext): Promise<Response> {
  const jsonText = await c.req.text()
  if (!jsonText) {
    const error = createResultError(op, "Missing request body")
    return c.json(error, 400)
  }

  const jsonSchema = v.pipe(v.string(), v.parseJson(), inputSchema)
  const parseResult = v.safeParse(jsonSchema, jsonText)
  if (!parseResult.success) {
    const errorMessage = v.summarize(parseResult.issues)
    const error = createResultError(op, "Invalid request body", errorMessage)
    return c.json(error, 400)
  }

  const input: InputSchema = parseResult.output

  if (input.token) {
    const tokenSecretResult = envTokenSecretResult(c.env)
    if (!tokenSecretResult.success) {
      const error = createResultError(op, tokenSecretResult.errorMessage)
      return c.json(error, 500)
    }

    const tokenResult = await verifyToken(input.token, tokenSecretResult.data)
    if (!tokenResult.success) {
      const error = createResultError(op, "Invalid token")
      return c.json(error, 401)
    }
  }

  const hasUrl = !!input.url
  const hasFile = !!input.file

  if (!hasUrl && !hasFile) {
    const error = createResultError(op, "Either url or file must be provided")
    return c.json(error, 400)
  }

  if (hasUrl && hasFile) {
    const error = createResultError(op, "Only one of url or file can be provided")
    return c.json(error, 400)
  }

  const outputFormat = input.outputFormat ?? "md"

  if (outputFormat !== "md" && !isPandocOutputFormat(outputFormat)) {
    const error = createResultError(op, `Unsupported output format: ${outputFormat}`)
    return c.json(error, 400)
  }

  let inputFilePath: string | null = null
  let outputFilePath: string | null = null

  try {
    let fileContent: Uint8Array | null = null
    let fileName = input.fileName ?? "input.pdf"

    if (hasUrl) {
      const downloadResult = await downloadFileFromUrl(input.url!)
      if (!downloadResult.success) {
        const error = createResultError(op, downloadResult.errorMessage)
        return c.json(error, 400)
      }
      fileContent = downloadResult.data.content
      fileName = downloadResult.data.fileName
    } else if (hasFile) {
      const fileContentStr = input.file
      if (!fileContentStr) {
        const error = createResultError(op, "File content is empty")
        return c.json(error, 400)
      }
      const decoded = Uint8Array.from(atob(fileContentStr), (ch) => ch.charCodeAt(0))
      fileContent = decoded
    }

    if (!fileContent) {
      const error = createResultError(op, "Failed to get file content")
      return c.json(error, 500)
    }

    const inputUuid = randomUUID()
    inputFilePath = `/tmp/pandoc-input-${inputUuid}-${fileName}`
    await writeFile(inputFilePath, fileContent)

    const outputUuid = randomUUID()
    const outputExt = outputFormat === "md" ? "md" : outputFormat
    outputFilePath = `/tmp/pandoc-output-${outputUuid}.${outputExt}`

    const conversionResult = await convertWithPandoc(inputFilePath, outputFilePath, outputFormat)
    if (!conversionResult.success) {
      const error = createResultError(op, conversionResult.errorMessage)
      return c.json(error, 500)
    }

    if (outputFormat === "md") {
      const { readFile } = await import("node:fs/promises")
      const outputContent = await readFile(outputFilePath, "utf-8")
      return new Response(outputContent, {
        headers: { "Content-Type": "text/markdown" },
      })
    }

    const uploadResult = await uploadToCfb2(c.env, outputFilePath, outputFormat)
    if (!uploadResult.success) {
      const error = createResultError(op, uploadResult.errorMessage)
      return c.json(error, 500)
    }

    return c.json({ url: uploadResult.data }, 200)
  } catch (e) {
    const error = createResultError(op, e instanceof Error ? e.message : "Unknown error")
    return c.json(error, 500)
  } finally {
    if (inputFilePath) {
      try {
        await unlink(inputFilePath)
      } catch { /* ignore */ }
    }
    if (outputFilePath) {
      try {
        await unlink(outputFilePath)
      } catch { /* ignore */ }
    }
  }
}
