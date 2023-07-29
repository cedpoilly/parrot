<script setup lang="ts">
useHead({
  title: "Parrot App //ASR & TTS",
})

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
      <h1 class="font-extrabold text-xl md:text-4xl text-center mt-[1em]">
        The Parrot App
      </h1>

      <h2 class="font-medium text-lg text-center mt-[1em]">
        A demo of transcription and text-to-speech.
      </h2>

      <div
        class="bg-slate-700 rounded my-4 border border-slate-500 border-dashed"
      >
        <div class="collapse collapse-arrow">
          <input type="radio" name="my-accordion-2" checked="checked" />
          <div class="collapse-title font-bold">For everyone</div>
          <div class="collapse-content">
            <p>
              This app repeats everything you say back to you. It will give you
              text, then will speak it back to you.
            </p>
          </div>
        </div>
        <div class="collapse collapse-arrow">
          <input type="radio" name="my-accordion-2" />
          <div class="collapse-title font-bold">For nerds</div>
          <div class="collapse-content">
            <p class="">
              In this demo we use the front-end of a Nuxt 3 app to upload an
              audio file to a Nuxt API route.
            </p>

            <p class="mt-[1em]">
              The API route processes the file with the `formidable` library to
              parse the multipart file.
            </p>

            <p class="mt-[1em]">
              The file is then sent to OpenAI's Whisper API, which is an ASR
              (Automatic Speech Recognition) API.
            </p>

            <p class="mt-[1em]">
              Then, we send the transcript to Narakeet and receive a sythesized
              audio back.
            </p>
          </div>
        </div>
      </div>
    </header>

    <p v-if="transcriptedText" class="text-xl">
      Transcription: {{ transcriptedText }}
    </p>

    <p v-if="transcriptionError" class="text-xl">
      Error: {{ transcriptionError }}
    </p>

    <LoadingIndicator v-if="isLoadingTranscript" class />

    <div class="grid bg-purple-400/10 rounded gap-y-3 px-4 py-4">
      <p class="text-3xl flex justify-end">
        <span class="text-base" style="text-wrap: balance">
          Press and hold the microphone button to record your message
        </span>
        <span class="flex items-center">🦜</span>
        <span class="flex items-center" v-if="parrotStatus === 'sleeping'">
          💤
        </span>

        <span
          v-if="parrotStatus === 'waking'"
          class="flex items-center loading loading-bars loading-lg"
        />

        <span v-if="parrotStatus === 'speaking'">📣</span>
      </p>

      <AudioPushInput @message-sent="handleAudioRecording" />
    </div>

    <TheMadeWithLoveBanner />
  </div>
</template>

<style lang="scss">
body {
  @apply bg-slate-800 text-slate-50;
}

#__nuxt {
  @apply min-h-screen grid items-center;
}
</style>
