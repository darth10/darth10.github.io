import fs from 'node:fs';
import path from 'node:path';

// Paths below are relative to web/, not to this file's directory.
const webRoot = path.resolve(import.meta.dir, '..');

const read = (...segments) =>
  fs.readFileSync(path.resolve(webRoot, ...segments), 'utf8').trim();

// The first /*! ... */ block of a file, without the delimiters or leading
// asterisks. Upstream packages put their copyright lines here.
const leadingNotice = (source) => {
  const match = source.match(/\/\*!([\s\S]*?)\*\//);
  if (!match) throw new Error('expected a /*! notice block');
  return match[1].split('\n').map((line) => line.replace(/^\s*\*? ?/, '')).join('\n').trim();
};

const mitLicense = read('../LICENSES/MIT.txt');
const mitMarker = 'Permission is hereby granted';
const mitStart = mitLicense.indexOf(mitMarker);
if (mitStart < 0) throw new Error(`LICENSES/MIT.txt: no "${mitMarker}"`);
const mitTerms = mitLicense.slice(mitStart).trim();

// highlight.js ships no license header in the sources we import, so its
// BSD-3-Clause notice has to be added explicitly. Every other notice reaches
// the sidecars on its own, by way of noticesFor below.
const hljsLicense = read('node_modules/highlight.js/LICENSE');
const hljsVersion = JSON.parse(read('node_modules/highlight.js/package.json')).version;

// Reproduces the shape webpack's BannerPlugin emitted, which Terser then
// extracted verbatim into the sidecar.
const block = (text) =>
  ['/*!', ...text.split('\n').map((line) => (line ? ` * ${line}` : ' *')), ' */'].join('\n');

export const hljsNoticeBlock = block([
  `highlight.js ${hljsVersion}`,
  '',
  hljsLicense
].join('\n'));

const section = (title, body) =>
  [title, '='.repeat(title.length), '', body].join('\n');

// Every source file in web/vendor/ carries its own notice and license terms in
// a .license sidecar of the same name, which is what the root LICENSE promises.
// Enforce that here rather than trusting it, then reproduce each one so the
// notices reach the built site as well as the repository.
const vendorDir = path.resolve(webRoot, 'vendor');
const vendorSidecar = (file) => `${file}.license`;
const vendorSources = fs.readdirSync(vendorDir).filter((file) => file.endsWith('.js')).sort();

vendorSources.forEach((file) => {
  if (!fs.existsSync(path.join(vendorDir, vendorSidecar(file)))) {
    throw new Error(`web/vendor/${file} has no ${vendorSidecar(file)} alongside it`);
  }
});

const vendorNotices = vendorSources.map((file) =>
  section(`${file} - bundled into /posts/*/post.min.js`, read('vendor', vendorSidecar(file))));

// OFL-1.1 clause 2 wants the notice and the license to accompany each copy of
// the font, so they are emitted next to the .woff2 files rather than only in
// the repository.
const oflMarker = 'This Font Software is licensed under the SIL Open Font License';
const oflSource = read('node_modules/@fontsource/alegreya-sans/LICENSE');
const oflStart = oflSource.indexOf(oflMarker);
if (oflStart < 0) throw new Error(`@fontsource/alegreya-sans/LICENSE: no "${oflMarker}"`);

// Fontsource derives its attribution from google/fonts and credits both
// families to Google Inc. That's incorrect, so the notices are taken from the
// upstream projects instead.
const fontNotices = [
  'Copyright 2013 The Alegreya Sans Project Authors',
  '(https://github.com/huertatipografica/Alegreya-Sans)',
  '',
  'Copyright (c) 2019 - Present, Microsoft Corporation,',
  'with Reserved Font Name Cascadia Code.'
].join('\n');

export const fontLicense = [
  section('Fonts served from /fonts/', fontNotices),
  'SIL Open Font License',
  oflSource.slice(oflStart).trim()
].join('\n\n');

export const thirdPartyNotices = [
  section('Third-party notices', [
    'This file covers the third-party code bundled into the built site. The',
    "site's own content and code are covered by LICENSE in the source",
    'repository: https://github.com/darth10/darth10.github.io'
  ].join('\n')),
  section('highlight.js - bundled into /js/darth10.github.io.min.js', hljsLicense),
  section(
    'base16 "Solarized Dark" theme - included in /css/darth10.github.io.css',
    [leadingNotice(read('node_modules/highlight.js/styles/base16/solarized-dark.css')), '',
     'Distributed as part of highlight.js; see its BSD 3-Clause text above.'].join('\n')
  ),
  section(
    'Turbo - bundled into /js/darth10.github.io.min.js',
    [leadingNotice(read('node_modules/@hotwired/turbo/dist/turbo.es2017-esm.js')), '', mitTerms].join('\n')
  ),
  section(
    'Bootstrap - compiled into /css/darth10.github.io.css and bundled into /js/darth10.github.io.min.js',
    read('node_modules/bootstrap/LICENSE')
  ),
  section('jQuery - bundled into /posts/*/post.min.js', read('node_modules/jquery/LICENSE.txt')),
  section(
    'Flot and its color helpers - bundled into /posts/*/post.min.js',
    read('node_modules/jquery.flot/LICENSE.txt')
  ),
  ...vendorNotices,
  section('Fonts served from /fonts/', `${fontNotices}\n\nSee /fonts/LICENSE.txt for the full license text.`)
].join('\n\n');

// Terser used to assemble the .LICENSE.txt sidecars by scanning the bundle it
// had just minified. Bun's bundler drops comments that are not marked legal
// with /*! or @license, and flot's are neither, so the sources are walked here
// instead and their notices collected the same way: every block comment that
// mentions a license or a copyright, in import order, deduplicated.
const NOTICE = /license|copyright/i;
const BLOCK_COMMENT = /\/\*[\s\S]*?\*\//g;
const SPECIFIERS = [
  /\bimport\s+['"]([^'"]+)['"]/g,
  /\b(?:import|export)\b[^'"();]*?\bfrom\s*['"]([^'"]+)['"]/g,
  /\brequire\s*\(\s*['"]([^'"]+)['"]\s*\)/g
];

const walk = (file, sources) => {
  if (sources.has(file)) return;

  const source = fs.readFileSync(file, 'utf8');
  sources.set(file, source);
  const dir = path.dirname(file);

  for (const pattern of SPECIFIERS) {
    for (const [, specifier] of source.matchAll(pattern)) {
      try {
        walk(Bun.resolveSync(specifier, dir), sources);
      } catch {
        // Builtins and anything else the bundler will not inline either.
      }
    }
  }
};

export const noticesFor = (entry) => {
  const sources = new Map();
  walk(path.resolve(entry), sources);

  const notices = new Set();
  for (const source of sources.values()) {
    const matches = source.match(BLOCK_COMMENT) ?? [];
    matches.filter((comment) => NOTICE.test(comment)).forEach((comment) => notices.add(comment));
  }
  return [...notices];
};
