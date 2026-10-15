"""Pre-records every paragraph in audio/texts.json (made by `npm run audio:texts`) in the Kokoro voice
named there, as Opus in WebM: audio/<voice>/<key>.webm, plus audio/<voice>/index.json listing what's
recorded. Paragraphs already recorded are skipped, so it's quick to rerun after editing text.

Needs: Python 3.10-3.12, `pip install kokoro soundfile torch` (a CUDA build of torch makes it about
20x faster on an NVIDIA GPU), and ffmpeg with libopus on PATH or in the FFMPEG environment variable.

Run: python scripts/build_audio.py [--prune]   (--prune deletes recordings no longer used)
"""

import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

import numpy as np
import torch
from kokoro import KPipeline

ROOT = Path(__file__).resolve().parent.parent
AUDIO = ROOT / 'audio'
RATE = 24000


def write_index(out: Path, voice: str, wanted: list[str]) -> None:
    done = [key for key in wanted if (out / f'{key}.webm').exists()]
    (out / 'index.json').write_text(json.dumps({'voice': voice, 'clips': done}) + '\n', encoding='utf8')


def main() -> None:
    spec = json.loads((AUDIO / 'texts.json').read_text(encoding='utf8'))
    voice, clips = spec['voice'], spec['clips']
    out = AUDIO / voice
    out.mkdir(parents=True, exist_ok=True)
    ffmpeg = os.environ.get('FFMPEG') or shutil.which('ffmpeg')
    if not ffmpeg:
        sys.exit('ffmpeg not found: put it on PATH or set FFMPEG to its path')

    wanted = [c['key'] for c in clips]
    if '--prune' in sys.argv:
        for old in out.glob('*.webm'):
            if old.stem not in set(wanted):
                old.unlink()

    todo = [c for c in clips if not (out / f"{c['key']}.webm").exists()]
    device = 'cuda' if torch.cuda.is_available() else 'cpu'
    print(f'{len(clips) - len(todo)} of {len(clips)} recorded; recording {len(todo)} on {device}', flush=True)
    if not todo:
        write_index(out, voice, wanted)
        return

    # The first letter of a Kokoro voice is its language: a = American English, b = British English.
    pipeline = KPipeline(lang_code=voice[0], repo_id='hexgrad/Kokoro-82M', device=device)
    start, spoken = time.time(), 0.0
    for i, clip in enumerate(todo, 1):
        # The script is the text with pronunciation fixes in Kokoro's [word](/phonemes/) syntax, when it has any.
        chunks = [r.audio.cpu().numpy() for r in pipeline(clip.get('script', clip['text']), voice=voice, speed=1) if r.audio is not None]
        audio = np.concatenate(chunks) if chunks else np.zeros(RATE // 10, dtype=np.float32)
        spoken += len(audio) / RATE
        pcm = (np.clip(audio, -1, 1) * 32767).astype('<i2').tobytes()
        # Speech-tuned Opus at 20 kbit/s: about 2.5 KB per second of speech.
        subprocess.run([ffmpeg, '-loglevel', 'error', '-y', '-f', 's16le', '-ar', str(RATE), '-ac', '1', '-i', 'pipe:0',
                        '-c:a', 'libopus', '-b:a', '20k', '-application', 'voip', str(out / f"{clip['key']}.webm")],
                       input=pcm, check=True)
        if i % 25 == 0 or i == len(todo):
            write_index(out, voice, wanted)
            took = time.time() - start
            print(f'{i}/{len(todo)}: {spoken / 60:.1f} min of speech in {took / 60:.1f} min ({clip["where"]})', flush=True)


if __name__ == '__main__':
    main()
