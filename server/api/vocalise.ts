import { createReadStream } from "fs"

import read from "~/server/service/vocalise"

export default defineEventHandler(async (event) => {
  const transcript = await readBody(event)

  const audioFilePath = await read(transcript)

  console.log("audio file path:", audioFilePath)

  const file = await sendStream(event, createReadStream(audioFilePath))

  return file
})
