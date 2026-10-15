// Hash router. Each view renders into <main> and may return a cleanup function.

import { $, html, mount, toast } from './dom.js';
import { storageConsent, grantStorage, declineStorage } from './store.js';
import { glassFor, moveLens } from './glass.js';
import { renderHome } from './home.js';
import { renderPath } from './cf/view.js';
import { renderUkiepc } from './cf/ukiepc-view.js';
import { renderMath } from './math/view.js';
import { renderLesson } from './math/lesson.js';
import { renderPrivacy, renderCookies } from './legal.js';

const routes = [
  [/^\/$/, () => renderHome, 'autoprep'],
  [/^\/path(?:\/([\w-]+))?$/, (m) => (app) => renderPath(app, m[1]), 'Codeforces path'],
  [/^\/ukiepc$/, () => renderUkiepc, 'UKIEPC practice'],
  [/^\/math$/, () => renderMath, 'Mental maths'],
  [/^\/math\/learn\/([\w-]+)$/, (m) => (app) => renderLesson(app, m[1]), 'Mental maths'],
  [/^\/privacy$/, () => renderPrivacy, 'Privacy policy'],
  [/^\/cookies$/, () => renderCookies, 'Cookie policy'],
];

const app = $('#app');
const nav = $('.nav');
let cleanup = null;
let firstRender = true;

const lens = $('.lens');

// On a page outside the main nav (the policies), the lens fades out.
function placeLens(instant) {
  const active = nav.querySelector('a[aria-current="page"]');
  if (active) moveLens(lens, active, { instant });
  else lens.style.opacity = '0';
}

function route() {
  const path = location.hash.replace(/^#/, '') || '/';
  let match = null;
  const found = routes.find(([re]) => (match = path.match(re)));
  if (!found) {
    location.replace('#/');
    return;
  }
  const [, make, title] = found;

  // Start the lens sliding before rendering, so the page work doesn't delay it.
  const section = path.split('/')[1] || '';
  for (const link of document.querySelectorAll('[data-nav]')) {
    if (link.dataset.nav === section) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  placeLens(firstRender);

  cleanup?.();
  cleanup = make(match)(app) || null;
  document.title = title === 'autoprep' ? title : `${title}: autoprep`;

  // A new page starts at the top, with focus moved to it for screen readers.
  window.scrollTo(0, 0);
  if (!firstRender) app.focus({ preventScroll: true });
  firstRender = false;
}

window.addEventListener('hashchange', route);
window.addEventListener('resize', () => placeLens(true));
document.fonts?.ready.then(() => placeLens(true));
glassFor($('.glass-nav'), 'glass-nav');
route();

// Nothing is written to storage until this notice is accepted.
function storageNotice() {
  if (storageConsent() !== 'unknown') return;
  const notice = document.createElement('section');
  notice.className = 'consent';
  notice.setAttribute('aria-label', 'Storage notice');
  mount(notice, html`
    <p><strong>Save your progress on this device?</strong> autoprep keeps your settings, rounds, solved problems and revealed hints in this browser's storage so they're still here next time. It's only used to make the site work: nothing is tracked, and none of it is sent anywhere. You can change your mind at any time in the <a href="#/cookies">cookie policy</a>.</p>
    <div class="btn-row">
      <button class="btn" type="button" data-consent="accept">Accept</button>
      <button class="btn" type="button" data-consent="decline">Not now</button>
    </div>`);
  notice.addEventListener('click', (e) => {
    const choice = e.target.closest('[data-consent]')?.dataset.consent;
    if (!choice) return;
    if (choice === 'accept') {
      grantStorage();
      toast('Saved. Your progress now stays on this device.');
    } else {
      declineStorage();
      toast('Nothing will be saved during this visit.');
    }
    notice.remove();
  });
  document.body.append(notice);
}
storageNotice();
