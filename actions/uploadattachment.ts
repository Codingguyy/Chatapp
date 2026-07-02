"use server"
import { writeFile } from "fs/promises"
import path from "path"
import crypto from "crypto"
import { messageattachment } from "@/types/1to1conversations"

const ALLOWED_TYPES: Record<string, "pdf" | "jpg"> = {
    "application/pdf": "pdf",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
}
const MAX_SIZE_BYTES = 8 * 1024 * 1024 // 8mb

export default async function Uploadattachment(formData: FormData): Promise<messageattachment | "Error"> {
    const file = formData.get("file") as File | null
    if (!file) {
        return "Error"
    }

    const filetype = ALLOWED_TYPES[file.type]
    if (!filetype) {
        return "Error"
    }
    if (file.size > MAX_SIZE_BYTES) {
        return "Error"
    }

    try {
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        const extension = filetype === "pdf" ? "pdf" : "jpg"
        const filename = `${crypto.randomUUID()}.${extension}`
        const uploadpath = path.join(process.cwd(), "public", "uploads", filename)
        await writeFile(uploadpath, buffer)

        return {
            url: `/uploads/${filename}`,
            type: filetype,
            name: file.name
        }
    } catch (error) {
        console.log("upload error", error)
        return "Error"
    }
}
