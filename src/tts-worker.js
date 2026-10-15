// Runs Kokoro, an 82M-parameter neural speech model, on the graphics card through WebGPU, off the
// main thread. The first use downloads the model (about 330 MB) from Hugging Face; the browser keeps
// it when storage is allowed. Only the model is fetched: the text being read never leaves the device.

import { KokoroTTS, env } from 'https://cdn.jsdelivr.net/npm/kokoro-js@1.2.1/dist/kokoro.web.js';

const MODEL = 'onnx-community/Kokoro-82M-v1.0-ONNX';
// onnxruntime warns about every node it runs on the CPU instead; that's expected here.
env.backends.onnx.logLevel = 'error';
let loading = null;
let dropBelow = 0; // requests from earlier reading sessions are skipped once those are stopped

function load(cache) {
  env.useBrowserCache = cache;
  loading ??= KokoroTTS.from_pretrained(MODEL, {
    // fp16 comes out as NaN on WebGPU, and the q8 model falls back to slow CPU kernels there.
    dtype: 'fp32',
    device: 'webgpu',
    progress_callback: (p) => {
      if (p.status === 'progress' && p.file?.endsWith('.onnx')) postMessage({ type: 'progress', loaded: p.loaded, total: p.total });
    },
  }).then(async (tts) => {
    // The first run compiles the GPU shaders (several seconds), so do it before any real sentence.
    await tts.generate('Ready.', { voice: 'af_heart' });
    postMessage({ type: 'ready' });
    return tts;
  }, (error) => {
    loading = null;
    throw error;
  });
  return loading;
}

// One request at a time, so audio comes back in the order it was asked for.
let chain = Promise.resolve();
let cache = true;

// kokoro-js keeps voice files in Cache Storage whatever env.useBrowserCache says. When storage isn't
// allowed, hand it a cache that keeps nothing.
const openCache = self.caches?.open?.bind(self.caches);
if (openCache) {
  self.caches.open = (name) => (cache || name !== 'kokoro-voices' ? openCache(name) : Promise.resolve({ match: async () => undefined, put: async () => {} }));
}

self.onmessage = ({ data }) => {
  if (data.type === 'load') {
    cache = data.cache;
    load(cache).catch((e) => postMessage({ type: 'error', message: String(e?.message || e) }));
  } else if (data.type === 'cancel') {
    dropBelow = Math.max(dropBelow, data.session + 1);
  } else if (data.type === 'speak') {
    chain = chain.then(async () => {
      if (data.session < dropBelow) return postMessage({ type: 'skip', id: data.id });
      try {
        const tts = await load(cache);
        if (data.session < dropBelow) return postMessage({ type: 'skip', id: data.id });
        const audio = await tts.generate(data.text, { voice: data.voice, speed: data.speed });
        postMessage({ type: 'audio', id: data.id, samples: audio.audio, rate: audio.sampling_rate }, [audio.audio.buffer]);
      } catch (e) {
        postMessage({ type: 'error', id: data.id, message: String(e?.message || e) });
      }
    });
  }
};
