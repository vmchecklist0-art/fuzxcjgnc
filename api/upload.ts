export const config = { runtime: "edge" }

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })

function arrayBufferToBase64(buffer: ArrayBuffer) {
  const bytes = new Uint8Array(buffer)
  let binary = ""
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return jsonResponse({ success: false, error: "Method not allowed" }, 405)
  }

  const apiKey = process.env.IMGBB_API_KEY
  if (!apiKey) {
    return jsonResponse({ success: false, error: "Missing IMGBB_API_KEY environment variable" }, 500)
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return jsonResponse({ success: false, error: "Invalid form submission" }, 400)
  }

  const image = formData.get("image")
  if (!(image instanceof File)) {
    return jsonResponse({ success: false, error: "Missing image file upload" }, 400)
  }

  const imageBuffer = await image.arrayBuffer()
  const base64 = arrayBufferToBase64(imageBuffer)
  const uploadData = new FormData()
  uploadData.append("key", apiKey)
  uploadData.append("image", base64)

  const response = await fetch("https://api.imgbb.com/1/upload", {
    method: "POST",
    body: uploadData,
  })

  const payload = await response.json().catch(() => null)
  if (!response.ok || !payload?.success) {
    return jsonResponse({ success: false, error: payload?.error?.message ?? "Upload failed" }, 500)
  }

  return jsonResponse({ success: true, data: { url: payload.data?.url ?? null } }, 200)
}
