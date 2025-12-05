(function () {

  const DATA = window.KNOWLEDGE_DATA?.items || [];

  function getQueryId() {
    const url = new URL(window.location.href);
    return url.searchParams.get("id");
  }

  const subtitleEl = document.getElementById("knowledge-detail-subtitle");
  const badgeEl    = document.getElementById("knowledge-detail-status-badge");
  const metaEl     = document.getElementById("knowledge-detail-meta");

  const overviewEl = document.getElementById("detail-overview");
  const symptomsEl = document.getElementById("detail-symptoms");
  const flowEl     = document.getElementById("detail-flow");
  const docsEl     = document.getElementById("detail-docs");

  function render(item) {
    subtitleEl.textContent = item.subtitle || item.title;

    // status
    if (item.statusLabel) {
      badgeEl.textContent = item.statusLabel;
      badgeEl.classList.remove("hidden");
    }

    // meta
    metaEl.textContent = [
      item.errorCode && `エラーコード: ${item.errorCode}`,
      item.series    && `対象: ${item.series}`,
      item.updatedAt && `最終更新: ${item.updatedAt}`,
    ].filter(Boolean).join(" | ");

    overviewEl.textContent = item.overview || "";

    symptomsEl.innerHTML = item.symptoms
      ? `<ul class="list-disc ml-5">${item.symptoms.map(s => `<li>${s}</li>`).join("")}</ul>`
      : "未登録";

    flowEl.innerHTML = item.flow
      ? `<ol class="list-decimal ml-5">${item.flow.map(s => `<li>${s}</li>`).join("")}</ol>`
      : "未登録";

    docsEl.innerHTML = item.docs
      ? `<ul class="list-disc ml-5">${item.docs.map(d =>
          `<li><a href="${d.href}" target="_blank" class="text-blue-600 underline">${d.label}</a></li>`
        ).join("")}</ul>`
      : "未登録";
  }

  function init() {
    const id = getQueryId();
    const item = DATA.find(x => x.id === id);
    if (item) render(item);
  }

  window.addEventListener("DOMContentLoaded", init);
})();
