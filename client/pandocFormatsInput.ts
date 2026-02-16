import { pandocFormatsShared } from "./pandocFormatsShared"

export const pandocFormatsInputOnly = [
  "csv",
  "t2t",
  "tikiwiki",
  "tsv",
  "twiki",
  "vimwiki",
] as const

export type PandocFormatInputOnly = (typeof pandocFormatsInputOnly)[number]

export const pandocInputFormats = [
  ...pandocFormatsShared,
  ...pandocFormatsInputOnly,
] as const

export type PandocInputFormat = (typeof pandocInputFormats)[number]
