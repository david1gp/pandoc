import { apiPathPandocFromUrl } from "@client/apiPathPandocFromUrl"
import { describe, expect, test } from "bun:test"
import { BASE_URL } from "./setup"

describe("pandoc convert from url", () => {
  test("pandoc returns error when no input provided", async () => {
    const response = await fetch(BASE_URL + apiPathPandocFromUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })

    expect(response.status).toBe(400)
    const json = (await response.json()) as { success: boolean }
    expect(json.success).toBe(false)
  })
})
