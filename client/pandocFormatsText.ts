import { pandocFormatsOutputText, pandocFormatsOutputBinary } from "./pandocFormatsOutput.js"

export const plainTextFormatsSet = new Set<string>([...pandocFormatsOutputText])

export const plainTextFormats = [...plainTextFormatsSet] as const

export const binaryFormats = [...pandocFormatsOutputBinary] as const

export const pandocFormatIsText = (format: string): boolean => plainTextFormatsSet.has(format)
