import dotenv from "dotenv"
import type { FieldsAndFiles, Files } from "h3-formidable"
import { readFiles } from "h3-formidable"

import { Configuration, OpenAIApi } from "openai"

dotenv.config()

const configuration = new Configuration({
  apiKey: process.env.OPENAI_KEY,
})

export default eventHandler(async (event) => {
  const filesObject = await readFiles(event)
  const files = Object.values(filesObject).flat()

  // console.log(Object.values(filesObject).flat()[0])

  const file = new File(
    [files[0] as BlobPart],
    (files[0] as any).originalFilename
  )

  console.log(file)

  const transcript = await transcribe(file)
  // console.log(transcript)

  return {
    ok: true,
  }
})

async function transcribe(buffer: File) {
  const openai = new OpenAIApi(configuration)
  const response = await openai.createTranscription(
    buffer, // The audio file to transcribe.
    "whisper-1", // The model to use for transcription.
    undefined, // The prompt to use for transcription.
    "json", // The format of the transcription.
    1, // Temperature
    "en" // Language
  )
  return response
}
