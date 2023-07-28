import { PathLike } from "fs"

import Whisper from "../Whisper"
const whisper = new Whisper(process.env.OPENAI_KEY as string)

export async function transcribeFile(path: PathLike) {
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
