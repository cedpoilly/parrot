import getFilePathFromEvent from "~/server/service/getFilePathFromEvent"
import { transcribeFile } from "~/server/service/transcribeFile"

export default eventHandler(async (event) => {
  const filePath = await getFilePathFromEvent(event)

  const { response: transcript, error } = await transcribeFile(filePath)

  if (transcript) {
    console.log("Transcript:", `${transcript}`)
  } else {
    console.error(error)
  }

  return {
    error,
    transcript,
  }
})
