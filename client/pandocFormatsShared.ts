export const pandocFormatsSharedText = [
  "biblatex",
  "bibtex",
  "commonmark",
  "commonmark_x",
  "csljson",
  "docbook",
  "docbook4",
  "docbook5",
  "dokuwiki",
  "gfm",
  "haddock",
  "html",
  "ipynb",
  "jats",
  "jira",
  "json",
  "latex",
  "man",
  "markdown",
  "markdown_github",
  "markdown_mmd",
  "markdown_phpextra",
  "markdown_strict",
  "mediawiki",
  "ms",
  "muse",
  "native",
  "opendocument",
  "opml",
  "org",
  "rst",
  "rtf",
  "textile",
] as const

export type PandocFormatSharedText = (typeof pandocFormatsSharedText)[number]

export const pandocFormatsSharedBinary = [
  "docx",
  "epub",
  "epub2",
  "epub3",
  "fb2",
  "odt",
  "pdf",
] as const

export type PandocFormatSharedBinary = (typeof pandocFormatsSharedBinary)[number]

export const pandocFormatsShared = [
  ...pandocFormatsSharedText,
  ...pandocFormatsSharedBinary,
] as const

export type PandocFormatShared = (typeof pandocFormatsShared)[number]
