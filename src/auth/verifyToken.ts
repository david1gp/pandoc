import { jwtVerify } from "jose"
import { createResult, createResultError, type PromiseResult } from "~utils/result/Result"

export type DecodedToken = {
  sub: string
  iat: number
  exp: number
}

export async function verifyToken(token: string, secret: string | undefined): PromiseResult<DecodedToken> {
  const op = "verifyToken"
  if (!secret) return createResultError(op, "missing secret")
  try {
    const encodedSecret = new TextEncoder().encode(secret)
    const verified = await jwtVerify(token, encodedSecret)
    const payload = verified.payload as DecodedToken
    return createResult(payload)
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : "Unknown error"
    return createResultError(op, message)
  }
}
