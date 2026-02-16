import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"
import { spawn } from "node:child_process"
import { readFile, writeFile, unlink } from "node:fs/promises"
import { basename, extname } from "node:path"

const op = "convertWithPandoc"

export async function convertWithPandoc(
  inputPath: string,
  outputPath: string,
  outputFormat: string,
): PromiseResult<string> {
  const inputExt = extname(inputPath).toLowerCase()
  let processedInputPath = inputPath

  if (inputExt === ".pdf") {
    const pdfTextPath = inputPath + ".txt"
    const pdfResult = await convertPdfToText(inputPath, pdfTextPath)
    if (!pdfResult.success) {
      return pdfResult
    }
    processedInputPath = pdfTextPath
  }

  return new Promise((resolve) => {
    const args = [processedInputPath, "-o", outputPath]
    if (outputFormat !== "md") {
      args.push("-t", outputFormat)
    } else {
      args.push("-t", "markdown")
    }

    const pandoc = spawn("pandoc", args)

    let stderr = ""

    pandoc.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    pandoc.on("close", async (code) => {
      if (processedInputPath !== inputPath) {
        try {
          await unlink(processedInputPath)
        } catch { /* ignore */ }
      }

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

async function convertPdfToText(pdfPath: string, textPath: string): PromiseResult<string> {
  return new Promise((resolve) => {
    const pdftotext = spawn("pdftotext", ["-layout", pdfPath, textPath])

    let stderr = ""

    pdftotext.stderr.on("data", (data) => {
      stderr += data.toString()
    })

    pdftotext.on("close", (code) => {
      if (code !== 0) {
        resolve(createResultError(op, `pdftotext exited with code ${code}: ${stderr}`))
        return
      }
      resolve(createResult(textPath))
    })

    pdftotext.on("error", (e) => {
      resolve(createResultError(op, e.message))
    })
  })
}
