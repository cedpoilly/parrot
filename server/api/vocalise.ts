import { createReadStream } from "fs"

import { AccessApprovalClient } from "@google-cloud/access-approval"

import read from "~/server/service/vocalise"

export default defineEventHandler(async (event) => {
  const transcript = await readBody(event)

  console.log(transcript)

  const projectId = "agent-human-handoff-sampl-geju"

  const client = new AccessApprovalClient()

  // * ---------------------------------------------------
  console.log(client)

  console.info("listing requests")
  const requests = await client.listApprovalRequests({
    parent: `projects/${projectId}`,
  })
  console.info(requests)
  // * ---------------------------------------------------

  const audioFilePath = await read(transcript)
  console.log(audioFilePath)

  console.log("audio file path:", audioFilePath)

  const file = await sendStream(event, createReadStream(audioFilePath))

  return file
})
