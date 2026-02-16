import * as v from "valibot"
import type { PandocInputFormat } from "./pandocFormatsInput"
import { pandocInputFormats } from "./pandocFormatsInput"
import { pandocFormatsShared } from "./pandocFormatsShared"

export const pandocFormatsOutputOnly = [
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
  "beamer",
  "chunkedhtml",
  "context",
  "djot",
  "dzslides",
  "haddock",
  "html4",
  "html5",
  "icml",
  "jats_archiving",
  "jats_articleauthoring",
  "jats_publishing",
  "man",
  "markua",
  "pdf",
  "plain",
  "pptx",
  "revealjs",
  "s5",
  "slideous",
  "slidy",
  "tei",
  "texinfo",
  "typst",
  "vimdoc",
  "xml",
  "xwiki",
  "zimwiki",
] as const

export type PandocFormatOutputOnly = (typeof pandocFormatsOutputOnly)[number]

export const pandocOutputFormats = [
  ...pandocFormatsShared,
  ...pandocFormatsOutputOnly,
] as const

export type PandocOutputFormat = (typeof pandocOutputFormats)[number]

export const isPandocOutputFormat = (value: string): value is PandocOutputFormat => {
  return (pandocOutputFormats as readonly string[]).includes(value)
}

export const isPandocInputFormat = (value: string): value is PandocInputFormat => {
  return (pandocInputFormats as readonly string[]).includes(value)
}

export const pandocOutputFormatSchema = v.picklist([...pandocOutputFormats])
export const pandocInputFormatSchema = v.picklist([...pandocInputFormats])
