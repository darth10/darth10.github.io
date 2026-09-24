// Flot is a plain script that reads jQuery from window. Post scripts import
// this module first; ESM evaluates it fully before the imports that follow.
import $ from 'jquery';

window.jQuery = window.$ = $;
