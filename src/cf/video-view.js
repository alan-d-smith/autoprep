// Explainer videos as click-to-play cards. Nothing loads from YouTube until you press play,
// and then it plays through youtube-nocookie.com.

import { html, raw } from '../dom.js';
import { PLAY_ICON } from '../icons.js';
import { VIDEOS } from './videos.js';

export function videosTpl(stageId) {
  const videos = VIDEOS[stageId] || [];
  if (!videos.length) return '';
  return html`
    <div class="videos">
      <h3>Watch</h3>
      <div class="video-grid">
        ${videos.map((v) => html`
          <div class="video" data-video="${v.id}">
            <button class="video-card" type="button" data-play-video="${v.id}" aria-label="Play ${v.title} by ${v.channel} (${v.length}) from YouTube">
              <span class="video-play">${raw(PLAY_ICON)}</span>
              <span class="video-text">
                <strong>${v.title}</strong>
                <span>${v.channel}, ${v.length}</span>
              </span>
            </button>
          </div>`)}
      </div>
      <p class="small faint">Videos play from YouTube when you press play.</p>
    </div>`;
}

export function bindVideos(root, signal) {
  root.addEventListener('click', (e) => {
    const button = e.target.closest('[data-play-video]');
    if (!button) return;
    const id = button.dataset.playVideo;
    const holder = button.closest('[data-video]');
    const frame = document.createElement('iframe');
    frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1&rel=0`;
    frame.title = button.getAttribute('aria-label').replace(/^Play /, '');
    frame.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    frame.allowFullscreen = true;
    frame.className = 'video-frame';
    holder.replaceChildren(frame);
    frame.focus();
  }, { signal });
}
