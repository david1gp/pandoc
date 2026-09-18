export const pandocFormatsSharedBinary = ["docx", "epub", "epub2", "epub3", "fb2", "odt", "pdf"] as const

export type PandocFormatSharedBinary = (typeof pandocFormatsSharedBinary)[number]
