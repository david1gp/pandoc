import { expect, test } from "bun:test"
import { readdir, readFile } from "node:fs/promises"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const CLIENT_DIR = join(__dirname, "../client")

async function getAllTsFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true })
  const files: string[] = []

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...(await getAllTsFiles(fullPath)))
    } else if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(fullPath)
    }
  }

  return files
}

const RELATIVE_IMPORT_RE = /^import\s+.*?\s+from\s+['"](\.\.[\\/])/gm
const ABSOLUTE_SRC_IMPORT_RE = /^import\s+.*?\s+from\s+['"]@\\/gm

test("client dir must not import from @ (src) or relative paths outside client", async () => {
  const files = await getAllTsFiles(CLIENT_DIR)
  const violations: { file: string; import: string }[] = []

  for (const file of files) {
    const content = await readFile(file, "utf-8")
    const relativeFile = file.replace(CLIENT_DIR + "/", "")

    const relativeRegex = /^import\s+.*?\s+from\s+['"](\.\.[^'"]+)/gm
    let match: RegExpExecArray | null = relativeRegex.exec(content)
    while (match !== null) {
      const importPath = match[1]
      if (!importPath) {
        violations.push({
          file: relativeFile,
          import: match[0],
        })
      } else {
        const doubleDotCount = (importPath.match(/\.\./g) || []).length
        if (doubleDotCount >= 2 || importPath.includes("/src/") || importPath.endsWith("/src")) {
          violations.push({
            file: relativeFile,
            import: match[0],
          })
        }
      }
      match = relativeRegex.exec(content)
    }

    const absoluteRegex = /^import\s+.*?\s+from\s+['"]@\\/gm
    match = absoluteRegex.exec(content)
    while (match !== null) {
      violations.push({
        file: relativeFile,
        import: match[0],
      })
      match = absoluteRegex.exec(content)
    }
  }

  if (violations.length > 0) {
    console.error("Client files cannot import from @ (src) or relative paths outside client folder:")
    for (const v of violations) {
      console.error(`  ${v.file}: ${v.import}`)
    }
  }

  expect(violations).toHaveLength(0)
})

const EXAMPLES_INVALID_RELATIVE = [
  `import { bar } from "../src/api"`,
  `import { foo } from "../../src/utils"`,
]

const EXAMPLES_INVALID_ABSOLUTE = [
  `import { qux } from "@/components/Button"`,
]

test("regex correctly identifies invalid relative .. imports (negative test)", () => {
  for (const example of EXAMPLES_INVALID_RELATIVE) {
    const relativeRegex = /import\s+.*?\s+from\s+['"](\.\.[^'"]+)/g
    const match = relativeRegex.exec(example)
    expect(match).not.toBeNull()
    const importPath = match?.[1]
    const doubleDotCount = (importPath?.match(/\.\./g) || []).length
    expect(doubleDotCount >= 2 || importPath?.includes("/src/") || importPath?.endsWith("/src")).toBe(true)
  }
})

test("regex correctly identifies invalid absolute @ imports (negative test)", () => {
  for (const example of EXAMPLES_INVALID_ABSOLUTE) {
    const absoluteRegex = /import\s+.*?\s+from\s+['"]@\//g
    const match = absoluteRegex.exec(example)
    expect(match).not.toBeNull()
  }
})
