// assets/js/knowledge/knowledgeEdit.js
(function () {
  const DATA =
    (typeof window !== "undefined" &&
      window.KNOWLEDGE_DATA &&
      Array.isArray(window.KNOWLEDGE_DATA.items))
      ? window.KNOWLEDGE_DATA.items
      : [];

  // DOM
  const targetIdEl     = document.getElementById("ke-target-id");

  const titleEl        = document.getElementById("ke-title");
  const subtitleEl     = document.getElementById("ke-subtitle");
  const errorCodeEl    = document.getElementById("ke-error-code");
  const kindEl         = document.getElementById("ke-kind");
  const statusEl       = document.getElementById("ke-status");
  const updatedEl      = document.getElementById("ke-updated");
  const seriesEl       = document.getElementById("ke-series");
  const tagsEl         = document.getElementById("ke-tags");

  const overviewEl     = document.getElementById("ke-overview");
  const symptomsEl     = document.getElementById("ke-symptoms");
  const flowEl         = document.getElementById("ke-flow");
  const docsEl         = document.getElementById("ke-docs");

  const backBtn        = document.getElementById("ke-back-btn");
  const draftBtn       = document.getElementById("ke-draft-btn");
  const saveBtn        = document.getElementById("ke-save-btn");

  function getIdFromQuery() {
    const url = new URL(window.location.href);
    return url.searchParams.get("id");
  }

  function findItem(id) {
    return DATA.find((x) => x.id === id);
  }

  // フォームへ反映
  function fillForm(item) {
    if (!item) return;

    if (targetIdEl) {
      targetIdEl.textContent = `編集対象ID: ${item.id}`;
    }

    titleEl.value     = item.title || "";
    subtitleEl.value  = item.subtitle || "";
    errorCodeEl.value = item.errorCode || "";
    kindEl.value      = item.kind || "";
    statusEl.value    = item.status || "";
    updatedEl.value   = item.updatedAt || "";
    seriesEl.value    = item.series || "";
    tagsEl.value      = (item.tags && item.tags.length)
      ? item.tags.join(", ")
      : "";

    overviewEl.value  = item.overview || "";

    symptomsEl.value  = (item.symptoms && item.symptoms.length)
      ? item.symptoms.join("\n")
      : "";

    flowEl.value      = (item.flow && item.flow.length)
      ? item.flow.join("\n")
      : "";

    if (item.docs && item.docs.length) {
      docsEl.value = item.docs
        .map((d) => (d.href ? `${d.label || ""} | ${d.href}` : (d.label || "")))
        .join("\n");
    } else {
      docsEl.value = "";
    }
  }

  // 入力からオブジェクト生成（ダミー）
  function collectForm(id) {
    const tags = (tagsEl.value || "")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const symptoms = (symptomsEl.value || "")
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const flow = (flowEl.value || "")
      .split("\n")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    const docs = (docsEl.value || "")
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .map((line) => {
        const parts = line.split("|");
        const label = (parts[0] || "").trim();
        const href  = (parts[1] || "").trim();
        const obj = { label };
        if (href) obj.href = href;
        return obj;
      });

    // statusLabel は status から簡易生成（実際のルールはサーバ側前提）
    let statusLabel = "";
    if (statusEl.value === "published") statusLabel = "公開";
    else if (statusEl.value === "draft") statusLabel = "下書き";
    else if (statusEl.value === "archived") statusLabel = "アーカイブ";

    return {
      id,
      title: titleEl.value.trim(),
      subtitle: subtitleEl.value.trim(),
      errorCode: errorCodeEl.value.trim(),
      kind: kindEl.value,
      status: statusEl.value,
      statusLabel,
      updatedAt: updatedEl.value.trim(),
      series: seriesEl.value.trim(),
      tags,
      overview: overviewEl.value,
      symptoms,
      flow,
      docs,
    };
  }

  function validateRequired() {
    if (!titleEl.value.trim()) {
      alert("タイトルは必須です。");
      titleEl.focus();
      return false;
    }
    return true;
  }

  function handleDraftSave(id) {
    if (!validateRequired()) return;
    const payload = collectForm(id);
    console.log("[Knowledge Edit] draft payload (dummy)", payload);
    alert("ダミー：下書き保存しました。（リロードすると内容はリセットされます）");
  }

  function handleSave(id) {
    if (!validateRequired()) return;
    const payload = collectForm(id);
    console.log("[Knowledge Edit] save payload (dummy)", payload);
    alert("ダミー：ナレッジを更新しました。\n一覧画面に戻ります。");
    window.location.href = "./knowledge.html";
  }

  function init() {
    const id = getIdFromQuery();
    if (!id) {
      alert("編集対象のナレッジIDが指定されていません。");
      return;
    }

    const item = findItem(id);
    if (!item) {
      alert(`ID "${id}" のナレッジが見つかりませんでした。`);
      return;
    }

    fillForm(item);

    if (backBtn) {
      backBtn.addEventListener("click", () => history.back());
    }
    if (draftBtn) {
      draftBtn.addEventListener("click", () => handleDraftSave(id));
    }
    if (saveBtn) {
      saveBtn.addEventListener("click", () => handleSave(id));
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
