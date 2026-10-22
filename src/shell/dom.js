// SPDX-License-Identifier: AGPL-3.0-only

/** @typedef {unknown} Child */

/**
 * Create a DOM element using properties and text/Node children, never HTML strings.
 * Child arrays are flattened; null, undefined, and booleans are omitted.
 * @param {string} tag
 * @param {Record<string, unknown> | null} props
 * @param {...Child} children
 * @returns {HTMLElement}
 */
export function el(tag, props, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props || {})) {
    if (value == null || /^on/i.test(key) || key === 'innerHTML' || key === 'outerHTML') continue;
    if (key === 'className') {
      node.className = String(value);
    } else if (key === 'dataset' && typeof value === 'object') {
      for (const [name, data] of Object.entries(value)) {
        if (data != null) node.dataset[name] = String(data);
      }
    } else if (key === 'style' && typeof value === 'object') {
      for (const [name, styleValue] of Object.entries(value)) {
        if (styleValue != null) Object.assign(node.style, {[name]:styleValue});
      }
    } else if (key.startsWith('aria-') || key.startsWith('data-')) {
      node.setAttribute(key, String(value));
    } else if (['type', 'title', 'disabled', 'hidden', 'draggable'].includes(key)) {
      const properties = /** @type {Record<string, unknown>} */ (/** @type {unknown} */ (node));
      const current = properties[key];
      properties[key] = typeof current === 'boolean' ? Boolean(value) : value;
    }
  }
  /** @param {Child} child */
  const append = child => {
    if (Array.isArray(child)) {
      for (const nested of child) append(nested);
    } else if (child == null || typeof child === 'boolean') {
      return;
    } else if (typeof child === 'string' || typeof child === 'number') {
      node.appendChild(document.createTextNode(String(child)));
    } else {
      node.appendChild(/** @type {Node} */ (child));
    }
  };
  for (const child of children) append(child);
  return node;
}
