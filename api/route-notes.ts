import { badRequest, json, methodNotAllowed } from "./utils"
import { db } from "./db"

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
    const routeId = String(req.query?.routeId ?? "").trim()
    if (!routeId) {
      return badRequest(res, "Missing routeId query parameter")
    }

    const result = await db.sql`
      SELECT id, route_id, type, text, created_at
      FROM route_notes
      WHERE route_id = ${routeId}
      ORDER BY created_at DESC`

    return json(res, { success: true, changelog: result.rows ?? [] })
  }

  if (method === "POST") {
    const body = parseJsonBody(req)
    const id = String(body.id ?? "").trim()
    const routeId = String(body.routeId ?? "").trim()
    const type = String(body.type ?? "").trim()
    const text = String(body.text ?? "").trim()

    if (!id || !routeId || !type || !text) {
      return badRequest(res, "Missing id, routeId, type, or text in request body")
    }

    await db.sql`
      INSERT INTO route_notes (id, route_id, type, text)
      VALUES (${id}, ${routeId}, ${type}, ${text})`

    return json(res, { success: true })
  }

  if (method === "DELETE") {
    const routeId = String(req.query?.routeId ?? "").trim()
    const type = String(req.query?.type ?? "").trim()
    if (!routeId || !type) {
      return badRequest(res, "Missing routeId or type query parameter")
    }

    await db.sql`
      DELETE FROM route_notes
      WHERE route_id = ${routeId}
        AND type = ${type}`

    return json(res, { success: true })
  }

  return methodNotAllowed(res, ["GET", "POST", "DELETE"])
}
