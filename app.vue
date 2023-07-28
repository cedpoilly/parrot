<script setup lang="ts">
const files = ref()
const transcriptedText = ref()
const transcriptionError = ref()

const isLoadingSpeech = ref(false)
const isLoadingTranscript = ref(false)
const parrotStatus = ref<"sleeping" | "waking" | "speaking">("sleeping")

const audioParrotFile = ref()

onMounted(async () => {
  try {
    await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    })
  } catch (error) {
    alert("Please allow the microphone access for this app to work. 👀 ")
  }
})

async function handleAudioUpload() {
  transcriptedText.value = ""
  transcriptionError.value = ""
  isLoadingSpeech.value = true

  try {
    const fd = new FormData()
    Array.from(files.value).map((file) => {
      fd.append("audio", file as File, "test.wav")
    })
    const { transcript, error } = await $fetch<{
      transcript: string | undefined
      error: Error | null
    }>("/api/transcribe", {
      method: "POST",
      body: fd,
    })

    transcriptedText.value = transcript
    transcriptionError.value = error
  } catch (error) {
    console.log(error)
  }

  isLoadingSpeech.value = false
}

function handleFile(e: any) {
  files.value = e.target.files
}

async function handleAudioRecording(message: { audio: Blob }) {
  transcriptedText.value = ""
  transcriptionError.value = ""
  isLoadingTranscript.value = true

  try {
    const fd = new FormData()
    fd.append("audio", message.audio, "test.wav")

    const { transcript, error } = await $fetch<{
      transcript: string
      error: Error
    }>("/api/transcribe", {
      method: "POST",
      body: fd,
    })

    transcriptedText.value = transcript
    transcriptionError.value = error

    parrotStatus.value = "waking"

    isLoadingTranscript.value = false
    isLoadingSpeech.value = true

    await requestAndPlayAudio(transcript)
  } catch (error) {
    console.error(error)
  }

  isLoadingSpeech.value = false
  isLoadingTranscript.value = false
}

async function requestAndPlayAudio(text: string) {
  const response = await $fetch("/api/vocalise", {
    method: "POST",
    body: text,
    responseType: "stream",
  })

  if (!((response as any) instanceof ReadableStream)) {
    alert(response as unknown as Error)
    console.log(response)
    return
  }

  audioParrotFile.value = await useGetFileFromStream(
    response as unknown as ReadableStream,
  )

  if (!audioParrotFile.value) {
    alert("Failed to get the audio file!")
    return
  }

  parrotStatus.value = "speaking"

  await usePlayTheAudioFile(audioParrotFile.value)

  parrotStatus.value = "sleeping"
}
</script>

<template>
  <div class="grid gap-y-4 px-4 py-8 max-w-xl mx-auto">
    <header class="grid">
      <h1 class="font-extrabold text-xl mt-[1em]">Whisper Nuxt demo</h1>

      <h2 class="font-medium text-lg mt-[1em]">
        A Nuxt "Fullstack" demo with Whisper from OpenAI
      </h2>

      <div
        class="bg-slate-700 px-4 py-4 rounded my-4 border border-slate-500 border-dashed"
      >
        <p class="">
          In this demo we use the front-end of a Nuxt 3 app to upload an audio
          file to a Nuxt API route.
        </p>
        <p class="mt-[1em]">
          The API route processes the file with the `formidable` library to
          parse the multipart file.
        </p>
        <p class="mt-[1em]">
          The file is then sent to OpenAI's Whisper API, which is an ASR
          (Automatic Speech Recognition) API.
        </p>
      </div>
    </header>

    <p v-if="transcriptedText" class="text-xl">
      Transcription: {{ transcriptedText }}
    </p>

    <p v-if="transcriptionError" class="text-xl">
      Error: {{ transcriptionError }}
    </p>

    <LoadingIndicator v-if="isLoadingTranscript" class />

    <div class="grid bg-purple-400/10 rounded px-4 py-4">
      <p class="mb-[0.5em]">
        Use the audio recorded to upload your own message.
      </p>

      <p class="text-3xl py-3 flex justify-end">
        🦜
        <span v-if="parrotStatus === 'sleeping'">💤</span>

        <span
          v-if="parrotStatus === 'waking'"
          class="loading loading-bars loading-lg"
        />

        <span v-if="parrotStatus === 'speaking'">📣</span>
      </p>

      <AudioPushInput @message-sent="handleAudioRecording" />
    </div>

    <div class="grid bg-purple-400/10 rounded px-4 py-4">
      <p class="mb-[0.5em]">Upload a pre-recorded file to transcribe.</p>

      <form @submit.prevent="handleAudioUpload" class="grid gap-y-2">
        <div
          class="bg-teal-900/30 rounded place-content-center h-12 px-4 grid py-1"
        >
          <input
            multiple
            type="file"
            class="border border-dashed border-teal-700 rounded"
            @change="handleFile($event)"
          />
        </div>
        <button
          :class="{ 'bg-green-600': files?.length }"
          type="submit"
          class="bg-teal-900 font-bold rounded h-11 px-4 py-1"
        >
          Submit
        </button>
      </form>
    </div>
  </div>
</template>

<style lang="scss">
body {
  @apply bg-slate-800 text-slate-50;
}
</style>
