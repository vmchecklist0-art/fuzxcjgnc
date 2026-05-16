import { badRequest, json, methodNotAllowed } from "./utils"
import { getStoreValue, setStoreValue } from "./db"

const parseJsonBody = (req: any) => {
  const body = req.body ?? {}
  if (typeof body === "string") {
    try {
      return JSON.parse(body)
    } catch {
      return {}
    }
  }
  return body
}

export default async function handler(req: any, res: any) {
  const method = String(req.method ?? "GET").toUpperCase()

  if (method === "GET") {
    const pages = await getStoreValue("plano", [])
    return json(res, { success: true, data: pages })
  }

  if (method === "POST") {
    const body = parseJsonBody(req)
    const pages = Array.isArray(body.pages) ? body.pages : null
    if (!pages) {
      return badRequest(res, "Missing pages array in request body")
    }

    await setStoreValue("plano", pages)
    return json(res, { success: true })
  }

  return methodNotAllowed(res, ["GET", "POST"])
}
