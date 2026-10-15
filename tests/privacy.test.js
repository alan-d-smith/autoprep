import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

// Loading a page must not contact anyone else (fonts, scripts, styles), or visitors' IP addresses go
// to a third party before they've agreed to anything. The privacy policy relies on this.
test('the page loads nothing from other hosts', () => {
  const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  const styles = readFileSync(new URL('../styles.css', import.meta.url), 'utf8');
  for (const tag of page.match(/<(link|script|img|iframe)\b[^>]*>/g)) assert.doesNotMatch(tag, /(href|src)="(https?:)?\/\//, tag);
  assert.doesNotMatch(styles, /url\(\s*['"]?(https?:)?\/\//);
  assert.doesNotMatch(styles, /@import/);
});

test('the footer links to both policies', () => {
  const page = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(page, /<footer[^>]*>[\s\S]*href="#\/privacy"[\s\S]*href="#\/cookies"[\s\S]*<\/footer>/);
});
