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
  const body = parseJsonBody(req)
  const store = await getStoreValue("rooster", { resources: [], shifts: [] })
  const resources = Array.isArray(store.resources) ? store.resources : []
  const shifts = Array.isArray(store.shifts) ? store.shifts : []

  if (method === "GET") {
    return json(res, { success: true, resources, shifts })
  }

  if (method === "POST") {
    const type = String(body.type ?? "").trim()
    if (type === "resource") {
      const id = String(body.id ?? "").trim()
      const name = String(body.name ?? "").trim()
      const role = String(body.role ?? "").trim()
      const color = String(body.color ?? "").trim()
      if (!id || !name) {
        return badRequest(res, "Missing resource id or name")
      }

      const nextResources = resources.filter((item: any) => item.id !== id)
      nextResources.push({ id, name, role, color })
      await setStoreValue("rooster", { resources: nextResources, shifts })
      return json(res, { success: true })
    }

    if (type === "shift") {
      const id = String(body.id ?? "").trim()
      const resourceId = String(body.resource_id ?? "").trim()
      const title = String(body.title ?? "").trim()
      const date = String(body.shift_date ?? "").trim()
      const startHour = Number(body.start_hour ?? -1)
      const endHour = Number(body.end_hour ?? -1)
      const color = String(body.color ?? "").trim()
      if (!id || !resourceId || !title || !date) {
        return badRequest(res, "Missing shift id, resource_id, title, or shift_date")
      }

      const nextShifts = shifts.filter((item: any) => String(item.id) !== id)
      nextShifts.push({ id, resource_id: resourceId, title, shift_date: date, start_hour: startHour, end_hour: endHour, color })
      await setStoreValue("rooster", { resources, shifts: nextShifts })
      return json(res, { success: true })
    }

    return badRequest(res, "Missing or invalid type for roster POST request")
  }

  if (method === "DELETE") {
    const type = String(req.query?.type ?? "").trim()
    const id = String(req.query?.id ?? "").trim()
    if (!type || !id) {
      return badRequest(res, "Missing type or id query parameter")
    }

    if (type === "resource") {
      const nextResources = resources.filter((item: any) => String(item.id) !== id)
      await setStoreValue("rooster", { resources: nextResources, shifts })
      return json(res, { success: true })
    }

    if (type === "shift") {
      const nextShifts = shifts.filter((item: any) => String(item.id) !== id)
      await setStoreValue("rooster", { resources, shifts: nextShifts })
      return json(res, { success: true })
    }

    return badRequest(res, "Invalid delete type for roster request")
  }

  return methodNotAllowed(res, ["GET", "POST", "DELETE"])
}
