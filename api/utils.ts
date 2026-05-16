export const json = (res: any, body: unknown, status = 200) => {
  res.status(status).json(body)
}

export const badRequest = (res: any, message: string) => {
  json(res, { success: false, error: message }, 400)
}

export const methodNotAllowed = (res: any, methods: string[]) => {
  json(res, { success: false, error: `Method not allowed. Allowed methods: ${methods.join(", ")}` }, 405)
}
