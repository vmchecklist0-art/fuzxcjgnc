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

  if (method === "GET") {
    const routes = await getStoreValue("routes", [])
    return json(res, { success: true, data: routes })
  }

  if (method === "POST") {
    const routes = Array.isArray(body.routes) ? body.routes : null
    if (!routes) {
      return badRequest(res, "Missing routes array in request body")
    }

    await setStoreValue("routes", routes)
    return json(res, { success: true })
  }

  if (method === "PATCH") {
    const id = typeof body.id === "string" ? body.id : ""
    if (!id) {
      return badRequest(res, "Missing route id")
    }

    const existingRoutes = await getStoreValue("routes", [])
    if (!Array.isArray(existingRoutes)) {
      return badRequest(res, "Routes store is invalid")
    }

    const updatedRoutes = existingRoutes.map((route: Record<string, unknown>) => {
      if (route.id !== id) return route
      return { ...route, ...body }
    })

    await setStoreValue("routes", updatedRoutes)
    return json(res, { success: true })
  }

  return methodNotAllowed(res, ["GET", "POST", "PATCH"])
}
