import {
  pandocFormatsSharedText,
  pandocFormatsSharedBinary,
} from "./pandocFormatsShared"

const pandocFormatsInputTextSpecific = [
  "asciidoc",
  "bits",
  "creole",
  "csv",
  "endnotexml",
  "mdoc",
  "pod",
  "ris",
  "t2t",
  "tikiwiki",
  "tsv",
  "twiki",
  "typst",
  "vimwiki",
  "xlsx",
  "xml",
] as const

export const pandocFormatsInputText = [
  ...pandocFormatsSharedText,
  ...pandocFormatsInputTextSpecific,
] as const

export type PandocFormatInputText = (typeof pandocFormatsInputText)[number]

const pandocFormatsInputBinarySpecific = [] as const

export const pandocFormatsInputBinary = [
  ...pandocFormatsSharedBinary,
  ...pandocFormatsInputBinarySpecific,
] as const

export type PandocFormatInputBinary = (typeof pandocFormatsInputBinary)[number]

export const pandocInputFormats = [
  ...pandocFormatsInputText,
  ...pandocFormatsInputBinary,
] as const

export type PandocInputFormat = (typeof pandocInputFormats)[number]

export const isPandocInputFormat = (value: string): value is PandocInputFormat => {
  return (pandocInputFormats as readonly string[]).includes(value)
}
