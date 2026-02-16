export function setHeaderTimingSingleValue(response: Response, key: string, startedAt: number): Response {
  const duration = Date.now() - startedAt
  const newHeaders = new Headers(response.headers)
  newHeaders.set(key, duration.toString())
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders,
  })
}
