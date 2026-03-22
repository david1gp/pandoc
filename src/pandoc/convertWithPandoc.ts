import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"
import { createResult, createResultError, type PromiseResult } from "@adaptive-ds/result"

const op = "convertWithPandoc"

export async function convertWithPandoc(
  inputPath: string,
  inputFormat: string,
  outputPath: string,
  outputFormat: string,
): PromiseResult<string> {
  const pdfPreprocessResult = inputFormat === "pdf"
    ? await convertPdfToTextFile(inputPath)
    : createResult<{ inputPath: string; inputFormat: string | undefined }>({
      inputPath,
      inputFormat: inputFormat || undefined,
    })
  if (!pdfPreprocessResult.success) {
    return pdfPreprocessResult
  }

  const effectiveInputPath = pdfPreprocessResult.data.inputPath
  const effectiveInputFormat = pdfPreprocessResult.data.inputFormat

  return new Promise((resolve) => {
    const args = [effectiveInputPath, "-o", outputPath]
    if (effectiveInputFormat) {
      args.push("-f", effectiveInputFormat)
    }
    args.push("-t", outputFormat ?? "markdown")

    const pandoc = spawn("pandoc", args)

    let stderr = ""

    pandoc.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    pandoc.on("close", async (code) => {
      if (code !== 0) {
        resolve(createResultError(op, `Pandoc exited with code ${code}: ${stderr}`))
        return
      }

      try {
        const content = await readFile(outputPath, "utf-8")
        resolve(createResult(content))
      } catch (e: unknown) {
        const message = e instanceof Error ? e.message : "Unknown error"
        resolve(createResultError(op, message))
      }
    })

    pandoc.on("error", (e) => {
      resolve(createResultError(op, e.message))
    })
  })
}

async function convertPdfToTextFile(
  inputPath: string,
): PromiseResult<{ inputPath: string; inputFormat: undefined }> {
  const textPath = `${inputPath}.txt`

  return new Promise((resolve) => {
    const pdftotext = spawn("pdftotext", [inputPath, textPath])
    let stderr = ""

    pdftotext.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    pdftotext.on("close", (code) => {
      if (code !== 0) {
        resolve(createResultError(op, `pdftotext exited with code ${code}: ${stderr}`))
        return
      }

      resolve(createResult({
        inputPath: textPath,
        inputFormat: undefined,
      }))
    })

    pdftotext.on("error", (e) => {
      resolve(createResultError(op, e.message))
    })
  })
}
