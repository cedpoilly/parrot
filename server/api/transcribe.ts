import { AccessApprovalClient } from "@google-cloud/access-approval"

import getFilePathFromEvent from "~/server/service/getFilePathFromEvent"
import { transcribeFile } from "~/server/service/transcribeFile"

export default eventHandler(async (event) => {
  const projectId = "agent-human-handoff-sampl-geju"

  const client = new AccessApprovalClient()

  async function listRequests() {
    const requests = await client.listApprovalRequests({
      parent: `projects/${projectId}`,
    })
    console.info(requests)
  }
  listRequests()

  const filePath = await getFilePathFromEvent(event)

  const { response: transcript, error } = await transcribeFile(filePath)

  if (!transcript) {
    console.error(error)
    return { error }
  }

  console.log("Transcript:", `${transcript}`)

  console.log(process.version)

  return {
    transcript,
  }
})
