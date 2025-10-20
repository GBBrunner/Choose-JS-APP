// Minimal polyfills for browser globals used by the app during tests
// This file is loaded by Jasmine before specs (see spec/support/jasmine.mjs helpers glob)

// Simple in-memory localStorage
const _store = Object.create(null);
globalThis.localStorage = {
  getItem(key) {
    return Object.prototype.hasOwnProperty.call(_store, key) ? _store[key] : null;
  },
  setItem(key, value) {
    _store[key] = String(value);
  },
  removeItem(key) {
    delete _store[key];
  },
  clear() {
    for (const k of Object.keys(_store)) delete _store[k];
  }
};

// Basic window/document shims
globalThis.window = globalThis.window || globalThis;
globalThis.window.addEventListener = globalThis.window.addEventListener || (() => {});
globalThis.window.dispatchEvent = globalThis.window.dispatchEvent || (() => {});

globalThis.CustomEvent = globalThis.CustomEvent || class CustomEvent {
  constructor(type, opts = {}) {
    this.type = type;
    this.detail = opts.detail;
  }
};

globalThis.document = globalThis.document || {
  getElementById: () => null,
  createElement: (tagName = 'div') => ({
    tagName: String(tagName).toUpperCase(),
    classList: { add: () => {}, remove: () => {}, toggle: () => {} },
    style: {},
    appendChild: () => {},
    querySelector: () => null,
    querySelectorAll: () => [],
    innerHTML: '',
    textContent: '',
    setAttribute: () => {},
    addEventListener: () => {}
  }),
  addEventListener: () => {},
  body: { appendChild: () => {} }
};

// Ensure console exists (Node has it) and no-op for matchMedia if used
globalThis.matchMedia = globalThis.matchMedia || (() => ({ matches: false, addEventListener: () => {}, removeEventListener: () => {} }));
