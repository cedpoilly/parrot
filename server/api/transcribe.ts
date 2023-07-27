import { PathLike } from "fs"
import { IncomingMessage } from "http"

import * as dotenv from "dotenv"

// @ts-ignore-next-line
import formidable, { Fields, Files } from "formidable"

import Whisper from "../Whisper"

dotenv.config()

const whisper = new Whisper(process.env.OPENAI_KEY as string)

export default eventHandler(async (event) => {
  const req = event.node.req

  const response = await parseMultipartNodeRequest(req)
  const fileObject = Object.values(response as Object).flat()[0]

  const { response: transcript, error } = await transcribe(
    // * kept as reference: path needs a file with an extension
    // * if the file has no extension, the code will fail.
    // "./American_English_sound__h__(female).wav"
    // "/tmp/704d56f6f17265614c312c600.wav"
    fileObject.filepath,
  )
  console.log("Transcript:", `${transcript}`)

  return {
    error,
    transcript,
  }
})

async function parseMultipartNodeRequest(req: IncomingMessage) {
  return new Promise((resolve, reject) => {
    const form = formidable({
      multiples: true,
      uploadDir: "./",
      filename: () => {
        return `temp_${Date.now().toString()}.wav`
      },
    })

    form.parse(req, (error: Error, fields: Fields, files: Files) => {
      if (error) {
        console.log(
          "ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ERROR ",
        )

        reject(error.message)
        return
      }

      resolve({ ...fields, ...files })
    })
  })
}

async function transcribe(path: PathLike) {
  console.log("Path:", path)

  let response
  let error

  try {
    response = await whisper.transcribe(path, "whisper-1")
  } catch (caughtError) {
    error = caughtError
    console.error(caughtError)
  }

  return { response, error }
}
