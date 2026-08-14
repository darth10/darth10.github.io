const fs = require('fs');
const path = require('path');

// Paths below are relative to web/, not to this file's directory.
const webRoot = path.resolve(__dirname, '..');

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
// BSD-3-Clause notice has to be added explicitly. BannerPlugin emits it as a
// /*! comment, which Terser then extracts into the .LICENSE.txt sidecar.
const hljsDir = path.resolve(webRoot, 'node_modules/highlight.js');
const hljsLicense = read('node_modules/highlight.js/LICENSE');
const hljsBanner = [
  `highlight.js ${require(path.join(hljsDir, 'package.json')).version}`,
  '',
  hljsLicense
].join('\n');

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

const fontLicense = [
  section('Fonts served from /fonts/', fontNotices),
  'SIL Open Font License',
  oflSource.slice(oflStart).trim()
].join('\n\n');

const thirdPartyNotices = [
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
    'Flot and its color helpers - bundled into /posts/*/post.min.js',
    read('node_modules/jquery.flot/LICENSE.txt')
  ),
  ...vendorNotices,
  section('Fonts served from /fonts/', `${fontNotices}\n\nSee /fonts/LICENSE.txt for the full license text.`)
].join('\n\n');

// Emits assembled text files that have no source counterpart to copy.
class EmitNoticesPlugin {
  constructor(assets) {
    this.assets = assets;
  }

  apply(compiler) {
    const { RawSource } = compiler.webpack.sources;
    compiler.hooks.thisCompilation.tap('EmitNoticesPlugin', (compilation) => {
      compilation.hooks.processAssets.tap({
        name: 'EmitNoticesPlugin',
        stage: compiler.webpack.Compilation.PROCESS_ASSETS_STAGE_ADDITIONAL
      }, () => {
        Object.entries(this.assets).forEach(([name, contents]) => {
          compilation.emitAsset(name, new RawSource(`${contents.trim()}\n`));
        });
      });
    });
  }
}

module.exports = { hljsBanner, fontLicense, thirdPartyNotices, EmitNoticesPlugin };
