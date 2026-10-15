// The privacy policy and the cookie policy, with the controls to allow or withdraw storage.
// Written for the UK GDPR, the EU GDPR, PECR and the ePrivacy Directive. If what the site sends or
// stores changes, update these pages and UPDATED.

import { html, mount, toast } from './dom.js';
import { storageConsent, grantStorage, withdrawStorage } from './store.js';

const UPDATED = '15 October 2026';
const CONTROLLER = 'Alan Smith';
const PRIVACY_EMAIL = 'support@latchlabs.app'; // requests about personal data
const GENERAL_EMAIL = 'hello@latchlabs.app';

const mail = (address) => html`<a href="mailto:${address}">${address}</a>`;

export function renderPrivacy(app) {
  mount(app, html`
    <article class="legal">
      <header class="page-head">
        <h1>Privacy policy</h1>
        <p>autoprep has no accounts, no analytics, no adverts and no cookies. Your progress stays in your own browser and is never sent to us. This page covers the few times data does leave your device, and your rights under the UK GDPR and the EU GDPR.</p>
        <p class="updated">Last updated ${UPDATED}.</p>
      </header>

      <section>
        <h2>Who is responsible</h2>
        <p>autoprep is a personal, non-commercial project run by ${CONTROLLER}, who is the data controller for this site. Email ${mail(PRIVACY_EMAIL)} about anything on this page, or ${mail(GENERAL_EMAIL)} for anything else.</p>
      </section>

      <section>
        <h2>When data leaves your device</h2>
        <h3>Visiting the site</h3>
        <p>Your browser fetches the pages from our web host, which receives your IP address, browser details and the addresses of the files requested, as with any website. This is used only to deliver the site and keep it secure; the host keeps it in its logs for its standard retention period and nothing else is done with it. Everything the site needs, including its fonts, scripts and recorded audio, comes from this host: no third-party trackers or font services are contacted.</p>
        <p class="legal-basis">Legal basis: legitimate interests in running a working, secure site (Article 6(1)(f)).</p>

        <h3>Progress saved on your device</h3>
        <p>Only if you accept the storage notice, your settings, rounds, solved problems, revealed hints and Codeforces handle are kept in your browser's storage. They are never sent to us or anyone else. The <a href="#/cookies">cookie policy</a> lists what's stored and lets you delete it.</p>
        <p class="legal-basis">Legal basis: your consent (Article 6(1)(a)), which you can withdraw at any time.</p>

        <h3>Codeforces sync</h3>
        <p>If you enter a Codeforces handle and press Sync, your browser asks the Codeforces API for that account's public rating and accepted submissions. Codeforces, which is based in Russia, receives your IP address and the handle, under its own privacy policy. Nothing is requested until you press Sync.</p>
        <p class="legal-basis">Legal basis: your consent, given by pressing Sync.</p>

        <h3>Videos</h3>
        <p>Explainer videos load from YouTube, through youtube-nocookie.com, only when you press play. Google then receives your IP address and may store data on your device, under Google's privacy policy.</p>
        <p class="legal-basis">Legal basis: your consent, given by pressing play.</p>

        <h3>Reading aloud</h3>
        <p>The recorded voice comes from this site. If you pick one of your browser's own voices, or something isn't recorded, your browser's speech engine reads it instead; some browsers make their online voices on their maker's servers (for example Microsoft Edge's "Online (Natural)" voices and Chrome's Google voices), so the text being read goes to that company. The other natural voices download a speech model from Hugging Face, and its code from jsDelivr, only after you agree to the download. The model then runs on your device and nothing you're reading is sent.</p>
        <p class="legal-basis">Legal basis: your consent, given by choosing the voice or agreeing to the download.</p>
      </section>

      <section>
        <h2>Outside the UK and EU</h2>
        <p>Codeforces, Google, Hugging Face, jsDelivr and browser makers may handle data in other countries, including the United States and Russia. This only happens when you use the feature concerned, directly between your browser and them.</p>
      </section>

      <section>
        <h2>What we don't do</h2>
        <p>No profiling, no automated decisions, no selling or sharing of data, and no database or account of any kind holding data about you.</p>
      </section>

      <section>
        <h2>Your rights</h2>
        <p>You have the right to access, correct or delete your personal data, to restrict or object to its use, to receive it in a portable form, and to withdraw consent at any time without affecting what happened before. Apart from the host's logs, we hold no data about you, so most of this is in your hands: delete what's stored on the <a href="#/cookies">cookie policy</a> page or by clearing this site's data in your browser. For anything else, email ${mail(PRIVACY_EMAIL)}.</p>
        <p>If you're ever unhappy with how your data is handled, please tell us first and we'll put it right. The law also gives you the right to raise it with a data protection authority: in the UK, the <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener">Information Commissioner's Office</a>; in the EU, the authority in the country where you live or work.</p>
      </section>

      <section>
        <h2>Changes</h2>
        <p>If what the site does with data changes, this page changes too, with a new date at the top.</p>
      </section>
    </article>`);
}

const STORED = [
  { name: 'autoprep:v1', where: 'Local storage', what: 'Your settings, mental-maths rounds, solved and ticked-off problems, revealed hints, page preferences and Codeforces handle.', kept: 'Until you delete it.', consent: true },
  { name: 'autoprep:storage-consent', where: 'Local storage', what: 'Remembers that you allowed storage.', kept: 'Until you turn storage off.', consent: false },
  { name: 'autoprep:storage-declined', where: 'Session storage', what: 'Remembers "Not now", so you aren\'t asked again during this visit.', kept: 'Until you close the tab.', consent: false },
  { name: 'transformers-cache, kokoro-voices', where: 'Cache storage', what: 'The natural voice model (about 330 MB), if you downloaded it while storage was allowed, so it isn\'t downloaded again.', kept: 'Until you delete it.', consent: true },
];

function choiceTpl() {
  const on = storageConsent() === 'granted';
  return html`
    <p>${on ? 'Storage is on: your progress is saved on this device.' : 'Storage is off: nothing is saved on this device.'}</p>
    <div class="btn-row">
      ${on
        ? html`<button class="btn" type="button" data-storage="withdraw">Turn off and delete my data</button>`
        : html`<button class="btn" type="button" data-storage="allow">Allow storage</button>`}
    </div>`;
}

export function renderCookies(app) {
  mount(app, html`
    <article class="legal">
      <header class="page-head">
        <h1>Cookie policy</h1>
        <p>autoprep doesn't use cookies. It can keep your progress in your browser's storage, which UK and EU law (PECR and the ePrivacy Directive) treats the same way as cookies, so it asks first and stores nothing until you agree.</p>
        <p class="updated">Last updated ${UPDATED}.</p>
      </header>

      <section>
        <h2>Your choice</h2>
        <div class="card storage-choice" data-storage-choice>${choiceTpl()}</div>
      </section>

      <section>
        <h2>What's stored</h2>
        <div class="stored">
          ${STORED.map((s) => html`
            <div class="stored-item">
              <code>${s.name}</code>
              <p>${s.what}</p>
              <p class="small faint">${s.where}. ${s.kept} ${s.consent ? 'Only with your consent.' : 'Strictly necessary to record your choice, so no consent is needed.'}</p>
            </div>`)}
        </div>
      </section>

      <section>
        <h2>Third parties</h2>
        <p>autoprep sets no third-party cookies. Pressing play on a video loads YouTube, which may then store its own data on your device under Google's policy; nothing from YouTube loads before you press play. The <a href="#/privacy">privacy policy</a> covers everything that's sent anywhere.</p>
      </section>

      <section>
        <h2>Deleting it yourself</h2>
        <p>Use the button above, or clear this site's data in your browser's settings. Either way, nothing is left behind anywhere else.</p>
      </section>
    </article>`);

  const controller = new AbortController();
  app.addEventListener('click', async (e) => {
    const action = e.target.closest('[data-storage]')?.dataset.storage;
    if (!action) return;
    if (action === 'allow') {
      grantStorage();
      document.querySelector('.consent')?.remove();
      toast('Storage is on. Your progress now stays on this device.');
    } else {
      await withdrawStorage();
      document.querySelector('.consent')?.remove();
      toast('Storage is off, and everything autoprep stored on this device is deleted.', 4000);
    }
    const box = app.querySelector('[data-storage-choice]');
    mount(box, choiceTpl());
    box.querySelector('button')?.focus();
  }, { signal: controller.signal });
  return () => controller.abort();
}
