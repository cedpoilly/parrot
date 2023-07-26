<script setup lang="ts">
const files = ref()
const transcriptedText = ref()
const transcriptionError = ref()
const isLoading = ref(false)

async function handleAudioUpload() {
  transcriptedText.value = ""
  transcriptionError.value = ""
  isLoading.value = true

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

  isLoading.value = false
}

function handleFile(e: any) {
  files.value = e.target.files
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
        :class="{ 'bg-green-600': files.length }"
        type="submit"
        class="bg-teal-900 font-bold rounded h-11 px-4 py-1"
      >
        Submit
      </button>
    </form>

    <p v-if="transcriptedText" class="text-xl">
      Transcription: {{ transcriptedText }}
    </p>
    <p v-if="transcriptionError" class="text-xl">
      Error: {{ transcriptionError }}
    </p>
    <p v-if="isLoading" class="fixed z-50 top-0 left-0 bg-red-900">
      <LoadingIndicator />
    </p>
  </div>
</template>

<style lang="scss">
body {
  @apply bg-slate-800 text-slate-50;
}
</style>
