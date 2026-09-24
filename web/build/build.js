import { $, Glob } from 'bun';
import fs from 'node:fs';
import path from 'node:path';
import {
  fontLicense,
  hljsNoticeBlock,
  noticesFor,
  thirdPartyNotices
} from './licenses.js';

const web = path.resolve(import.meta.dir, '..');
const out = path.resolve(web, '../public');

// Scripts are loaded with <script type="module">, so the bundles are plain ESM
// and nothing is down-levelled: the dependencies were never transpiled either.
const shared = {
  target: 'browser',
  format: 'esm',
  minify: true,
  sourcemap: 'none'
};

const written = [];

const bundle = async (options) => {
  const result = await Bun.build({ ...shared, ...options });
  if (!result.success) throw new AggregateError(result.logs, 'bun build failed');
  result.outputs.forEach((artifact) => written.push(path.relative(out, artifact.path)));
};

const emit = async (file, contents) => {
  await Bun.write(path.join(out, file), contents);
  written.push(file);
};

// Terser wrote this pointer at the head of every bundle it extracted comments
// from, and the sidecars it named are assembled by noticesFor.
const sidecarPointer = (name) =>
  `/*! For license information please see ${name}.LICENSE.txt */`;

const sidecar = (notices) => `${notices.join('\n\n')}\n`;

const mainEntry = path.join(web, 'js/darth10.github.io.js');

await bundle({
  entrypoints: [mainEntry],
  outdir: path.join(out, 'js'),
  naming: '[name].min.[ext]',
  banner: sidecarPointer('darth10.github.io.min.js')
});

await emit('js/darth10.github.io.min.js.LICENSE.txt',
           sidecar([hljsNoticeBlock, ...noticesFor(mainEntry)]));

// Each script in web/js/posts is built into public/posts/<entry name>/post.min.js,
// so a script's filename must match the slug of the post that loads it.
const postsDir = path.join(web, 'js/posts');
const postEntries = fs.readdirSync(postsDir)
  .filter((file) => file.endsWith('.js'))
  .map((file) => path.join(postsDir, file));

await bundle({
  entrypoints: postEntries,
  outdir: path.join(out, 'posts'),
  naming: '[name]/post.min.[ext]',
  banner: sidecarPointer('post.min.js'),
  format: 'iife'
});

for (const entry of postEntries) {
  await emit(path.join('posts', path.basename(entry, '.js'), 'post.min.js.LICENSE.txt'),
             sidecar(noticesFor(entry)));
}

// Bun cannot read Sass, so the stylesheet is compiled by dart-sass and the
// highlight.js theme appended to it, which is what the JS entry point used to
// pull in through css-loader. Root-absolute url() references are left alone by
// both halves, so the fonts below resolve against the site root.
// Bootstrap's partials resolve through the node_modules load path. Its own
// deprecation warnings are silenced; ours for @import are too, since Bootstrap
// 5 does not support @use yet.
const styles = await $`sass --style=compressed --no-source-map --quiet-deps --silence-deprecation=import --load-path ${path.join(web, 'node_modules')} ${path.join(web, 'scss/darth10.github.io.scss')}`.text();
const theme = await Bun.file(path.join(web, 'node_modules/highlight.js/styles/base16/solarized-dark.css')).text();

await emit('css/darth10.github.io.css', `${styles.trim()}\n${theme.trimEnd()}\n`);

const fontPatterns = [
  '@fontsource/alegreya-sans/files/alegreya-sans-latin-{400,500,700}-normal.woff2',
  '@fontsource/cascadia-code/files/cascadia-code-latin-{400,700}-normal.woff2'
];
const expectedFonts = 5;
let fonts = 0;

for (const pattern of fontPatterns) {
  const glob = new Glob(pattern);
  for await (const file of glob.scan({ cwd: path.join(web, 'node_modules'), absolute: true })) {
    await emit(path.join('fonts', path.basename(file)), Bun.file(file));
    fonts += 1;
  }
}

// base.html preloads two of these by name, so a glob that quietly stops
// matching would ship a site whose fonts 404 rather than one that fails here.
if (fonts !== expectedFonts) {
  throw new Error(`expected ${expectedFonts} fonts under node_modules/@fontsource, copied ${fonts}`);
}

await emit('THIRD-PARTY-NOTICES.txt', `${thirdPartyNotices.trim()}\n`);
await emit('fonts/LICENSE.txt', `${fontLicense.trim()}\n`);

console.log(written.sort().join('\n'));
