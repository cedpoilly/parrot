import { PathLike, writeFileSync } from "fs"

import { TextToSpeechClient } from "@google-cloud/text-to-speech"

export default async function read(input: string) {
  const client = new TextToSpeechClient()

  const outputFile = "./output.mp3"

  const request = {
    input: { text: input },
    voice: { languageCode: "en-US", ssmlGender: "FEMALE" },
    audioConfig: { audioEncoding: "MP3" },
  }

  console.log("Synthesizing...")

  // @ts-ignore-next-line
  const [response] = await client.synthesizeSpeech(request)
  console.log(response)

  writeFileSync(outputFile, response.audioContent, "binary")

  console.log(`Audio content written to file: ${outputFile}`)

  return outputFile as PathLike
}
