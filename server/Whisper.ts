import * as fs from "fs"

import axios from "axios"

import * as FormDataDefault from "form-data"
// @ts-ignore-next-line
const FormData = FormDataDefault.default

export default class Whisper {
  apiKey: string
  baseUrl: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.baseUrl = "https://api.openai.com/v1/audio"
  }

  async transcribe(filePath: fs.PathLike, modelName: string) {
    const formData = new FormData()

    formData.append("file", fs.createReadStream(filePath))
    formData.append("model", modelName)

    try {
      const response = await axios.post(
        `${this.baseUrl}/transcriptions`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
            "Content-Type": `multipart/form-data; boundary=${formData._boundary}`,
          },
        },
      )

      return response.data.text
    } catch (error: any) {
      console.error(error)

      throw new Error(error.response.data.error)
    }
  }
}
