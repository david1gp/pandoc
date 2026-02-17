import { spawn } from "node:child_process"
import { readFile } from "node:fs/promises"
import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

const op = "convertWithPandoc"

export async function convertWithPandoc(
  inputPath: string,
  inputFormat: string,
  outputPath: string,
  outputFormat: string,
): PromiseResult<string> {
  let effectiveInputFormat: string | undefined = inputFormat || undefined

  return new Promise((resolve) => {
    const args = [inputPath, "-o", outputPath]
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
