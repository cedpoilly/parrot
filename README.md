# Nuxt Whisper Demo

This is my parrot app that I built for fun. Say something and it will reply back.

## About this demo

In this demo we use the front-end of a `Nuxt 3` app to upload an audio file to a Nuxt API route.

The API route processes the file with the `formidable` library to parse the multipart file.

The file is then sent to OpenAI's `Whisper` API, which is an ASR (Automatic Speech Recognition) API.

## Improvements

There are a few improvements I want to bring to the app. Below are a few of them.

### Audio visualisation [status: research]

When the user speaks, we want to visualise the audio. We also want the visualisation for when the parrot speaks back.

Here is an article that I have found: [A Guide To Audio Visualization With JavaScript And GSAP (Part 1)](https://www.smashingmagazine.com/2022/03/audio-visualization-javascript-gsap-part1/)

### General UI updates [status: research]

- [] parrot icon, including the favicon
- [] move the description out of the way, make it accessible via a button
- [] make it visually appealing with an animated parrot

### Make it a PWA

- [] Make the app installable
- [] Make it open offline
- [] When offline, use the browser's SpeechSynthesis API


## Configuration

You will need to create a `.env` file and set the `OPENAI_KEY` key to your own OpenAI key. This implies that you have an account at [openai.com](https://openai.com).
Go to [platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys) to create a new `secret key`.

Your `.env` file should look like this:

```env
OPENAI_KEY=sk-dja9sd8jas9d8ajsd9asjda9djasd98sjd98ajd98sajdas9 # not a real key
```

## Starting up the Nuxt project

> The following is from the "Nuxt Minimal Starter" guide

Look at the [Nuxt 3 documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

### Setup

Make sure to install the dependencies:

```bash
# yarn
yarn install

# npm
npm install

# pnpm
pnpm install
```

### Development Server

Start the development server on http://localhost:3000

```bash
npm run dev
```

### Production

Build the application for production:

```bash
npm run build
```

Locally preview production build:

```bash
npm run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.
