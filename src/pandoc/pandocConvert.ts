import { spawn } from "node:child_process"
import { readFile, writeFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { createResult, createResultError, type PromiseResult } from "@adaptive-ds/result"

const op = "pandocConvert"
const defaultProcessTimeoutMs = 30_000
const defaultConversionTimeoutMs = 120_000
const processKillGraceMs = 250
const pdfPageDpi = 200
const maxPdfPages = 100

export async function pandocConvert(
  inputPath: string,
  inputFormat: string,
  outputPath: string,
  outputFormat: string,
): PromiseResult<string> {
  const deadline = Date.now() + getPositiveEnvironmentNumber("PANDOC_CONVERSION_TIMEOUT_MS", defaultConversionTimeoutMs)
  const pdfPreprocessResult =
    inputFormat === "pdf"
      ? await convertPdfToTextFile(inputPath, deadline)
      : createResult<{ inputPath: string; inputFormat: string | undefined }>({
          inputPath,
          inputFormat: inputFormat || undefined,
        })
  if (!pdfPreprocessResult.success) {
    return pdfPreprocessResult
  }

  const effectiveInputPath = pdfPreprocessResult.data.inputPath
  const effectiveInputFormat = pdfPreprocessResult.data.inputFormat

  const args = [effectiveInputPath, "-o", outputPath]
  if (effectiveInputFormat) {
    args.push("-f", effectiveInputFormat)
  }
  args.push("-t", outputFormat ?? "markdown")

  const pandocResult = await runCommandWithDeadline("pandoc", args, deadline)
  if (!pandocResult.success) {
    return pandocResult
  }

  try {
    const content = await readFile(outputPath, "utf-8")
    return createResult(content)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return createResultError(op, message)
  }
}

async function convertPdfToTextFile(
  inputPath: string,
  deadline: number,
): PromiseResult<{ inputPath: string; inputFormat: undefined }> {
  const textPath = join(dirname(inputPath), "pdf-text.txt")
  const pdftotextResult = await runCommandWithDeadline(
    process.env.PANDOC_PDFTOTEXT_COMMAND ?? "pdftotext",
    ["-layout", "-enc", "UTF-8", inputPath, "-"],
    deadline,
  )
  if (!pdftotextResult.success) {
    return pdftotextResult
  }

  const pages = splitPdfTextIntoPages(pdftotextResult.data.stdout)
  if (pages.length > maxPdfPages) {
    return createResultError(op, `PDF has more than ${maxPdfPages} pages`)
  }

  const pageTexts: string[] = []
  for (const [pageIndex, pageText] of pages.entries()) {
    if (pageText.trim()) {
      pageTexts.push(pageText)
      continue
    }

    const ocrResult = await convertPdfPageWithOcr(inputPath, pageIndex + 1, deadline)
    if (!ocrResult.success) {
      return ocrResult
    }

    pageTexts.push(ocrResult.data)
  }

  try {
    await writeFile(textPath, pageTexts.join("\n\n"), "utf8")
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return createResultError(op, message)
  }

  return createResult({
    inputPath: textPath,
    inputFormat: undefined,
  })
}

async function convertPdfPageWithOcr(inputPath: string, pageNumber: number, deadline: number): PromiseResult<string> {
  const pagePrefix = join(dirname(inputPath), `ocr-page-${pageNumber}`)
  const imagePath = `${pagePrefix}.png`
  const renderResult = await runCommandWithDeadline(
    process.env.PANDOC_PDFTOPPM_COMMAND ?? "pdftoppm",
    [
      "-r",
      String(pdfPageDpi),
      "-png",
      "-singlefile",
      "-f",
      String(pageNumber),
      "-l",
      String(pageNumber),
      inputPath,
      pagePrefix,
    ],
    deadline,
  )
  if (!renderResult.success) {
    return renderResult
  }

  const ocrResult = await runCommandWithDeadline(
    process.env.PANDOC_TESSERACT_COMMAND ?? "tesseract",
    [imagePath, "stdout", "-l", "eng+deu"],
    deadline,
  )
  if (!ocrResult.success) {
    return ocrResult
  }

  return createResult(ocrResult.data.stdout)
}

function splitPdfTextIntoPages(text: string): string[] {
  const pages = text.split("\f")
  if (text.endsWith("\f")) {
    pages.pop()
  }
  return pages.length > 0 ? pages : [""]
}

async function runCommandWithDeadline(command: string, args: string[], deadline: number): PromiseResult<CommandOutput> {
  const remainingMs = deadline - Date.now()
  if (remainingMs <= 0) {
    return createResultError(op, `Command timed out before starting: ${command}`)
  }

  const timeoutMs = Math.min(
    remainingMs,
    getPositiveEnvironmentNumber("PANDOC_PROCESS_TIMEOUT_MS", defaultProcessTimeoutMs),
  )
  return runCommand(command, args, timeoutMs)
}

async function runCommand(command: string, args: string[], timeoutMs: number): PromiseResult<CommandOutput> {
  return new Promise((resolve) => {
    let stdout = ""
    let stderr = ""
    let processError: Error | null = null
    let didTimeout = false
    let didClose = false
    let timeoutTimer: ReturnType<typeof setTimeout> | undefined
    let killTimer: ReturnType<typeof setTimeout> | undefined

    const child = spawn(command, args, {
      detached: process.platform !== "win32",
      stdio: ["ignore", "pipe", "pipe"],
    })

    const finish = (result: PromiseResult<CommandOutput>) => {
      if (timeoutTimer) clearTimeout(timeoutTimer)
      if (killTimer) clearTimeout(killTimer)
      resolve(result)
    }

    child.stdout.on("data", (data: Buffer | string) => {
      stdout += data.toString()
    })

    child.stderr.on("data", (data: Buffer | string) => {
      stderr += data.toString()
    })

    child.once("error", (error) => {
      processError = error
    })

    child.once("close", (code, signal) => {
      didClose = true
      if (didTimeout) {
        finish(createResultError(op, `Command timed out after ${timeoutMs}ms: ${command}`))
        return
      }

      if (processError) {
        finish(createResultError(op, `${command} failed to start: ${processError.message}`))
        return
      }

      if (code !== 0) {
        const status = signal ? `signal ${signal}` : `code ${code}`
        finish(createResultError(op, `${command} exited with ${status}: ${stderr}`))
        return
      }

      finish(createResult({ stdout, stderr }))
    })

    timeoutTimer = setTimeout(() => {
      didTimeout = true
      childProcessKill(child, "SIGTERM")

      killTimer = setTimeout(() => {
        if (didClose) return
        childProcessKill(child, "SIGKILL")
      }, processKillGraceMs)
    }, timeoutMs)
  })
}

function childProcessKill(child: ReturnType<typeof spawn>, signal: NodeJS.Signals): void {
  if (child.pid && process.platform !== "win32") {
    try {
      process.kill(-child.pid, signal)
      return
    } catch {
      /* The process group may have exited between the timeout and kill. */
    }
  }

  try {
    child.kill(signal)
  } catch {
    /* The process may have exited between the timeout and kill. */
  }
}

function getPositiveEnvironmentNumber(name: string, fallback: number): number {
  const value = Number(process.env[name])
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : fallback
}

type CommandOutput = {
  stdout: string
  stderr: string
}
