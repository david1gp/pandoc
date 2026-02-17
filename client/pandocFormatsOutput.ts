import {
  pandocFormatsSharedText,
  pandocFormatsSharedBinary,
} from "./pandocFormatsShared"

const pandocFormatsOutputTextSpecific = [
  "ansi",
  "asciidoc",
  "asciidoc_legacy",
  "asciidoctor",
  "bbcode",
  "bbcode_fluxbb",
  "bbcode_hubzilla",
  "bbcode_phpbb",
  "bbcode_steam",
  "bbcode_xenforo",
  "djot",
  "html4",
  "html5",
  "jats_archiving",
  "jats_articleauthoring",
  "jats_publishing",
  "man",
  "markua",
  "plain",
  "tei",
  "texinfo",
  "vimdoc",
  "xml",
  "xwiki",
  "zimwiki",
] as const

export const pandocFormatsOutputText = [
  ...pandocFormatsSharedText,
  ...pandocFormatsOutputTextSpecific,
] as const

export type PandocFormatOutputText = (typeof pandocFormatsOutputText)[number]

const pandocFormatsOutputBinarySpecific = [
  "beamer",
  "chunkedhtml",
  "context",
  "dzslides",
  "icml",
  "pptx",
  "revealjs",
  "s5",
  "slideous",
  "slidy",
  "typst",
] as const

export const pandocFormatsOutputBinary = [
  ...pandocFormatsSharedBinary,
  ...pandocFormatsOutputBinarySpecific,
] as const

export type PandocFormatOutputBinary = (typeof pandocFormatsOutputBinary)[number]

export const pandocOutputFormats = [
  ...pandocFormatsOutputText,
  ...pandocFormatsOutputBinary,
] as const

export type PandocOutputFormat = (typeof pandocOutputFormats)[number]

export const isPandocOutputFormat = (value: string): value is PandocOutputFormat => {
  return (pandocOutputFormats as readonly string[]).includes(value)
}

export { isPandocInputFormat } from "./pandocFormatsInput"
