import { PathLike } from "fs"

import type { H3Event } from "h3"
import { readFiles } from "h3-formidable"

export default async function getFilePathFromEvent(event: H3Event) {
  const response = await readFiles(event, {
    multiples: true,
    uploadDir: "./",
    filename: () => {
      return `temp_${Date.now().toString()}.wav`
    },
  })

  const fileObject = Object.values(response as Object).flat()[0]
  return fileObject.filepath as PathLike
}
