// シンプルな DOM ユーティリティ

window.$ = function (selector, root) {
  return (root || document).querySelector(selector);
};

window.$$ = function (selector, root) {
  return Array.from((root || document).querySelectorAll(selector));
};

window.createEl = function (tag, className, html) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (html !== undefined) el.innerHTML = html;
  return el;
};
