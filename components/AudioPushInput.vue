<script setup lang="ts">
import { MicrophoneIcon } from "@heroicons/vue/24/solid"

const emit = defineEmits(["message-sent"])

const startDate = ref()
const isRecording = ref(false)
const showControls = ref(false)
const shouldStop = ref(false)
const stopped = ref(false)
const recordedChunks = ref<BlobPart[]>([])
const mediaRecorder = ref<MediaRecorder | null>()
const stream = ref<MediaStream>()
const duration = ref<number>(0)

async function startRecording() {
  const canProceed = await handlePermissionRequestResponse()
  if (!canProceed) {
    alert(
      "Cannot record as mic permission was rejected. 🤷🏼‍♂️" +
        "Please allow mic permission manually to record your thoughts.",
    )

    return
  }

  startDate.value = new Date()
  isRecording.value = true
  showControls.value = true

  shouldStop.value = false
  stopped.value = false

  clearSources()

  const options = { mimeType: "audio/webm" }
  recordedChunks.value = []

  if (!mediaRecorder.value) {
    mediaRecorder.value = new MediaRecorder(
      stream.value as MediaStream,
      options,
    )
  }

  mediaRecorder.value.addEventListener("dataavailable", onDataAvailable)
  mediaRecorder.value.addEventListener("stop", onStopMediaRecorder)

  if (mediaRecorder.value.state === "recording") {
    mediaRecorder.value.stop()
  }

  mediaRecorder.value.start(100)
  isRecording.value = true
}

async function handlePermissionRequestResponse() {
  let permissionGranted

  try {
    const response = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    })

    handleSuccess(response)

    permissionGranted = true
  } catch (error) {
    console.error("Mic permission denied")

    alert("Mic permission denied")
  }

  return permissionGranted
}

function handleSuccess(_stream: MediaStream) {
  stream.value = _stream
}

function formatDuration(duration: number) {
  if (!duration) {
    return `00:00`
  }

  const roundedDuration = Math.round(duration)
  const paddedDuration = roundedDuration.toString().padStart(2, "0")
  return `00:${paddedDuration}`
}

function onDataAvailable(e: BlobEvent) {
  const dataAvailable = e.data.size > 0

  if (dataAvailable) {
    recordedChunks.value.push(e.data)

    const now = new Date().getTime()
    duration.value = (now - startDate.value) / 1000
    if (duration.value >= 60) {
      shouldStop.value = true
    }
  }

  const recordingShouldStop =
    shouldStop.value === true && stopped.value === false

  if (recordingShouldStop) {
    if (mediaRecorder.value) {
      mediaRecorder.value.stop()
    }

    stopped.value = true
    isRecording.value = false
  }
}

function onStopMediaRecorder() {
  const blob = new Blob(recordedChunks.value)

  setSources()

  mediaRecorder.value?.removeEventListener("dataavailable", onDataAvailable)
  mediaRecorder.value?.removeEventListener("stop", onStopMediaRecorder)

  emit("message-sent", {
    audio: blob,
    timestamp: new Date().getTime().toString(),
  })

  showControls.value = true

  resetRecording()
}

async function stopRecordingAndSubmit() {
  shouldStop.value = true
  isRecording.value = false
}

function resetRecording() {
  isRecording.value = false
  duration.value = 0

  mediaRecorder.value = null
}

function clearSources() {}
function setSources() {}
</script>

<template>
  <div class="audio-input">
    <span
      class="audio-input__duration mx-2 rounded bg-slate-200 px-4 dark:bg-slate-500"
      :class="{ 'audio-input__duration--visible': mediaRecorder }"
      >{{ formatDuration(duration) }}</span
    >

    <button
      id="audio-message-start-recording"
      class="submit-button record-button transition ripple mx-2 h-10 w-10 p-1 rounded-full font-bold text-slate-50 disabled:bg-slate-400 [&:not(:active)]:hover:bg-red-300"
      :class="{
        'record-button--active bg-red-400 scale-105': isRecording,
        'record-button--initial bg-slate-400': !isRecording,
        'record-button--overlay': duration > 0 && !isRecording,
      }"
      title="Press & hold to record. Release to submit."
      ref="startButton"
      @mousedown="startRecording"
      @mouseup="stopRecordingAndSubmit"
    >
      <MicrophoneIcon />
    </button>
  </div>
</template>

<style lang="scss">
.audio-input {
  @apply flex h-16 w-auto items-center
    justify-end
    rounded-xl bg-teal-200 px-2
    py-2 text-center dark:bg-teal-900;
}
</style>
