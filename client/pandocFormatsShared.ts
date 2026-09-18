import { pandocFormatsSharedBinary } from "./pandocFormatsSharedBinary.js"
import { pandocFormatsSharedText } from "./pandocFormatsSharedText.js"

export const pandocFormatsShared = [...pandocFormatsSharedText, ...pandocFormatsSharedBinary] as const

export type PandocFormatShared = (typeof pandocFormatsShared)[number]
