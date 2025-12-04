// assets/js/operator/operator.js

// ==============================
// データラッパ (operatorData.js 側の OPERATOR_DATA を使用)
// ==============================
const DATA =
  (typeof window !== "undefined" && window.OPERATOR_DATA)
    ? window.OPERATOR_DATA
    : {
        utterances: [],
        suggestionVersions: {},
        knowledgeDetails: {}
      };

// ==============================
// 簡易ユーティリティ
// ==============================
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

// ==============================
// DOM 取得
// ==============================
const utteranceListEl      = $("#utterance-list");

const modeAutoBtn          = $("#mode-auto");
const modeManualBtn        = $("#mode-manual");
const btnFetch             = $("#btn-fetch");
const btnPause             = $("#btn-pause");

const followupContentEl    = $("#followup-content");
const causesContentEl      = $("#causes-content");
const scriptContentEl      = $("#script-content");
const sourcesContentEl     = $("#sources-content");

const knowledgeSubtitleEl  = $("#knowledge-subtitle");
const detailOverviewEl     = $("#detail-overview");
const detailSymptomsEl     = $("#detail-symptoms");
const detailFlowEl         = $("#detail-flow");
const detailDocsEl         = $("#detail-docs");

const btnOpenKnowledgeTab  = $("#btn-open-knowledge"); // ナレッジ詳細右上の「別タブで開く」ボタン

// ==============================
// 状態管理
// ==============================
const state = {
  mode: "auto",               // "auto" | "manual"
  autoUpdatesPaused: false,
  utteranceIndex: 0,
  utteranceTimer: null,
  lastAutoVersion: null,      // "v1" | "v2"

  currentSuggestionVersion: null, // "v1" | "v2"

  // ピン留め対象 3種類
  followups: [],  // {id, text, pinned}
  causes: [],     // {id, text, pinned}
  sources: [],    // {id, label, pinned, active}

  selectedKnowledgeId: null
};

// ==============================
// 発話ログ
// ==============================
function renderUtteranceCard(utt) {
  const wrapper = document.createElement("div");
  wrapper.className = [
    "border border-gray-200 rounded-lg p-3 text-sm",
    utt.role === "customer" ? "bg-sky-50" : "bg-rose-50"
  ].join(" ");

  wrapper.innerHTML = `
    <div class="flex items-center justify-between text-xs text-gray-500 mb-1">
      <span>${utt.time}</span>
      <span class="font-semibold">${utt.speaker}</span>
    </div>
    <p>${utt.text.replace(/\n/g, "<br>")}</p>
  `;
  return wrapper;
}

function startUtteranceFlow() {
  const utterances = DATA.utterances || [];
  if (!utterances.length) return;

  state.utteranceTimer = setInterval(() => {
    if (state.utteranceIndex >= utterances.length) {
      clearInterval(state.utteranceTimer);
      return;
    }
    const next = utterances[state.utteranceIndex++];
    utteranceListEl.appendChild(renderUtteranceCard(next));

    // 自動モード時の AI示唆トリガ
    if (state.mode === "auto" && !state.autoUpdatesPaused) {
      if (state.utteranceIndex === 3 && state.lastAutoVersion !== "v1") {
        applySuggestion("v1");
        state.lastAutoVersion = "v1";
      } else if (state.utteranceIndex === 6 && state.lastAutoVersion !== "v2") {
        applySuggestion("v2");
        state.lastAutoVersion = "v2";
      }
    }
  }, 2000); // 2秒ごとに 1 発話追加
}

// ==============================
// AI示唆 レンダリング
// ==============================

// 共通：ピン付き → 通常 の順に並べる
function sortPinnedFirst(array) {
  return [...array].sort((a, b) => {
    if (a.pinned === b.pinned) return 0;
    return a.pinned ? -1 : 1;
  });
}

// --- 追加で確認すべき質問（ピン留め対応） ---
function renderFollowups() {
  const items = state.followups;
  if (!items.length) {
    followupContentEl.textContent = "AI示唆がまだ生成されていません。";
    return;
  }

  followupContentEl.innerHTML = "";

  const ul = document.createElement("ul");
  ul.className = "space-y-1";

  sortPinnedFirst(items).forEach((item) => {
    const li = document.createElement("li");
    li.dataset.id = item.id;

    const row = document.createElement("div");
    row.className = [
      "flex items-start justify-between gap-2 px-2 py-1 rounded",
      item.pinned ? "bg-yellow-50" : ""
    ].join(" ");

    const text = document.createElement("span");
    text.className = "text-sm";
    text.textContent = item.text;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = [
      "ml-2 shrink-0 text-xs px-2 py-1 rounded-full border",
      item.pinned
        ? "border-yellow-400 bg-yellow-100 text-yellow-700"
        : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
    ].join(" ");
    btn.textContent = "📌";
    btn.title = item.pinned ? "ピン留めを解除" : "ピン留め";

    btn.addEventListener("click", () => {
      item.pinned = !item.pinned;
      renderFollowups();
    });

    row.appendChild(text);
    row.appendChild(btn);
    li.appendChild(row);
    ul.appendChild(li);
  });

  followupContentEl.appendChild(ul);
}

// --- 推定される原因候補（ピン留め対応） ---
function renderCauses() {
  const items = state.causes;
  if (!items.length) {
    causesContentEl.textContent = "AI示唆がまだ生成されていません。";
    return;
  }

  causesContentEl.innerHTML = "";

  const ul = document.createElement("ul");
  ul.className = "space-y-1";

  sortPinnedFirst(items).forEach((item) => {
    const li = document.createElement("li");
    li.dataset.id = item.id;

    const row = document.createElement("div");
    row.className = [
      "flex items-start justify-between gap-2 px-2 py-1 rounded",
      item.pinned ? "bg-yellow-50" : ""
    ].join(" ");

    const text = document.createElement("span");
    text.className = "text-sm";
    text.textContent = item.text;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = [
      "ml-2 shrink-0 text-xs px-2 py-1 rounded-full border",
      item.pinned
        ? "border-yellow-400 bg-yellow-100 text-yellow-700"
        : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
    ].join(" ");
    btn.textContent = "📌";
    btn.title = item.pinned ? "ピン留めを解除" : "ピン留め";

    btn.addEventListener("click", () => {
      item.pinned = !item.pinned;
      renderCauses();
    });

    row.appendChild(text);
    row.appendChild(btn);
    li.appendChild(row);
    ul.appendChild(li);
  });

  causesContentEl.appendChild(ul);
}

// --- 一次案内文 ---
function renderScript(text) {
  if (!text) {
    scriptContentEl.textContent = "AI示唆がまだ生成されていません。";
    return;
  }
  scriptContentEl.textContent = text;
}

// --- 引用元ナレッジ（候補） ピン留め＋選択でナレッジ詳細表示 ---
function renderSources() {
  const items = state.sources;
  if (!items.length) {
    sourcesContentEl.textContent = "AI示唆がまだ生成されていません。";
    return;
  }

  sourcesContentEl.innerHTML = "";

  const ul = document.createElement("ul");
  ul.className = "space-y-1 text-sm";

  sortPinnedFirst(items).forEach((item) => {
    const li = document.createElement("li");

    const row = document.createElement("div");
    // ★ 行コンテナ全体を pinned でハイライト
    row.className = [
      "flex items-start justify-between gap-2 px-2 py-1 rounded border text-xs transition-colors",
      item.pinned
        ? "bg-amber-50 border-amber-300 shadow-sm"
        : "bg-white border-transparent hover:bg-slate-50"
    ].join(" ");

    const btn = document.createElement("button");
    btn.type = "button";
    btn.dataset.knowledgeId = item.id;
    btn.className = [
      "w-full text-left text-sm",
      item.active
        ? "font-semibold text-slate-900"
        : "text-blue-700"
    ].join(" ");
    btn.textContent = item.label;

    btn.addEventListener("click", () => {
      state.sources.forEach((s) => {
        s.active = s.id === item.id;
      });
      renderSources();
      applyKnowledgeDetail(item.id);
    });

    const pinBtn = document.createElement("button");
    pinBtn.type = "button";
    pinBtn.className = [
      "ml-2 shrink-0 text-xs px-2 py-1 rounded-full border",
      item.pinned
        ? "border-amber-400 bg-amber-100 text-amber-700"
        : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"
    ].join(" ");
    pinBtn.textContent = "📌";
    pinBtn.title = item.pinned ? "ピン留めを解除" : "ピン留め";

    pinBtn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      item.pinned = !item.pinned;
      renderSources();
    });

    row.appendChild(btn);
    row.appendChild(pinBtn);
    li.appendChild(row);
    ul.appendChild(li);
  });

  sourcesContentEl.appendChild(ul);
}


// --- 指定バージョンの AI示唆を適用 ---
function applySuggestion(versionKey) {
  const versions = DATA.suggestionVersions || {};
  const v = versions[versionKey];
  if (!v) return;

  state.currentSuggestionVersion = versionKey;

  //
  // 1. 既存状態をスナップショット
  //
  const prevFollowups = state.followups || [];
  const prevCauses    = state.causes || [];
  const prevSources   = state.sources || [];

  const prevFollowupMap = {};
  prevFollowups.forEach((item) => {
    prevFollowupMap[item.id] = item;
  });

  const prevCauseMap = {};
  prevCauses.forEach((item) => {
    prevCauseMap[item.id] = item;
  });

  const prevSourceMap = {};
  prevSources.forEach((item) => {
    prevSourceMap[item.id] = item;
  });

  const prevPinnedFollowups = prevFollowups.filter((i) => i.pinned);
  const prevPinnedCauses    = prevCauses.filter((i) => i.pinned);
  const prevPinnedSources   = prevSources.filter((i) => i.pinned);

  //
  // 2. 新しいサジェストを適用
  //    - pinned なものは「前回のテキスト」をそのまま維持
  //    - 新バージョンから消えた pinned も先頭側に追加して生かす
  //

  // --- followups ---
  let nextFollowups = (v.followups || []).map((item, idx) => {
    const id   = item.id || `f-${versionKey}-${idx + 1}`;
    const prev = prevFollowupMap[id];
    const wasPinned = !!(prev && prev.pinned);
    const pinned    = wasPinned || !!item.pinned;

    return {
      id,
      // pinned の場合は prev.text を優先して固定
      text: pinned && prev ? prev.text : (item.text || ""),
      pinned
    };
  });

  // v2 側から消えた pinned も生き残らせる
  prevPinnedFollowups.forEach((p) => {
    if (!nextFollowups.some((x) => x.id === p.id)) {
      nextFollowups.unshift({
        id: p.id,
        text: p.text,
        pinned: true
      });
    }
  });

  // --- causes ---
  let nextCauses = (v.causes || []).map((item, idx) => {
    const id   = item.id || `c-${versionKey}-${idx + 1}`;
    const prev = prevCauseMap[id];
    const wasPinned = !!(prev && prev.pinned);
    const pinned    = wasPinned || !!item.pinned;

    return {
      id,
      text: pinned && prev ? prev.text : (item.text || ""),
      pinned
    };
  });

  prevPinnedCauses.forEach((p) => {
    if (!nextCauses.some((x) => x.id === p.id)) {
      nextCauses.unshift({
        id: p.id,
        text: p.text,
        pinned: true
      });
    }
  });

  // --- sources ---
  let nextSources = (v.sources || []).map((item, idx) => {
    const id   = item.id || `s-${versionKey}-${idx + 1}`;
    const prev = prevSourceMap[id];
    const wasPinned = !!(prev && prev.pinned);
    const pinned    = wasPinned || !!item.pinned;

    return {
      id,
      // ラベルも pinned の場合は前回のものを固定
      label: pinned && prev ? prev.label : (item.label || item.text || ""),
      pinned,
      // active は以前の状態を引き継ぐ（なければ false）
      active: prev ? !!prev.active : false
    };
  });

  prevPinnedSources.forEach((p) => {
    if (!nextSources.some((x) => x.id === p.id)) {
      nextSources.unshift({
        id: p.id,
        label: p.label,
        pinned: true,
        active: !!p.active
      });
    }
  });

  state.followups = nextFollowups;
  state.causes    = nextCauses;
  state.sources   = nextSources;

  //
  // 3. レンダリング & ナレッジ詳細は自動更新しない
  //
  renderFollowups();
  renderCauses();
  renderScript(v.script);
  renderSources();

  // 引用元ナレッジをクリックするまで詳細は表示しない
  clearKnowledgeDetail();
}

// ナレッジ詳細を空にしてプレースホルダを表示
function clearKnowledgeDetail() {
  state.selectedKnowledgeId = null;

  if (knowledgeSubtitleEl) {
    knowledgeSubtitleEl.textContent = "引用元ナレッジを選択すると詳細が表示されます。";
  }
  if (detailOverviewEl) detailOverviewEl.textContent = "";
  if (detailSymptomsEl) detailSymptomsEl.innerHTML = "";
  if (detailFlowEl) detailFlowEl.innerHTML = "";
  if (detailDocsEl) detailDocsEl.innerHTML = "";
}

// ==============================
// ナレッジ詳細
// ==============================
function applyKnowledgeDetail(id) {
  const all = DATA.knowledgeDetails || {};
  const k = all[id];
  if (!k) return;

  state.selectedKnowledgeId = id;

  knowledgeSubtitleEl.textContent = k.subtitle;

  // 概要
  detailOverviewEl.textContent = k.overview;

  // 症状と想定される原因（5行想定）
  const ulSymptoms = document.createElement("ul");
  ulSymptoms.className = "list-disc ml-5 space-y-1";
  (k.symptoms || []).forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    ulSymptoms.appendChild(li);
  });
  detailSymptomsEl.innerHTML = "";
  detailSymptomsEl.appendChild(ulSymptoms);

  // 一次対応フロー
  const olFlow = document.createElement("ol");
  olFlow.className = "list-decimal ml-5 space-y-1";
  (k.flow || []).forEach((s) => {
    const li = document.createElement("li");
    li.textContent = s;
    olFlow.appendChild(li);
  });
  detailFlowEl.innerHTML = "";
  detailFlowEl.appendChild(olFlow);

  // 引用元ドキュメント
  const ulDocs = document.createElement("ul");
  ulDocs.className = "list-disc ml-5 space-y-1";
  (k.docs || []).forEach((d) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = d.href || "#";
    a.textContent = d.label;
    a.className = "text-blue-600 hover:underline";
    a.target = "_blank";
    li.appendChild(a);
    ulDocs.appendChild(li);
  });
  detailDocsEl.innerHTML = "";
  detailDocsEl.appendChild(ulDocs);
}

// 別タブでナレッジ詳細を開く
function openKnowledgeInNewTab() {
  const id = state.selectedKnowledgeId;
  if (!id) return;

  const all = DATA.knowledgeDetails || {};
  const k = all[id];
  if (!k) return;

  const win = window.open("", "_blank");
  if (!win) return;

  const html = `
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>${k.subtitle}</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-900">
  <main class="max-w-3xl mx-auto p-6 space-y-6">
    <header>
      <h1 class="text-2xl font-semibold mb-1">${k.subtitle}</h1>
      <p class="text-sm text-gray-600">オペレーター支援ナレッジ詳細</p>
    </header>

    <section class="bg-white rounded-xl border border-gray-200 p-4">
      <h2 class="text-sm font-semibold mb-2">概要</h2>
      <p class="text-sm leading-relaxed">${k.overview}</p>
    </section>

    <section class="bg-white rounded-xl border border-gray-200 p-4">
      <h2 class="text-sm font-semibold mb-2">症状と想定される原因</h2>
      <ul class="list-disc ml-5 space-y-1 text-sm">
        ${(k.symptoms || []).map((s) => `<li>${s}</li>`).join("")}
      </ul>
    </section>

    <section class="bg-white rounded-xl border border-gray-200 p-4">
      <h2 class="text-sm font-semibold mb-2">一次対応フロー</h2>
      <ol class="list-decimal ml-5 space-y-1 text-sm">
        ${(k.flow || []).map((s) => `<li>${s}</li>`).join("")}
      </ol>
    </section>

    <section class="bg-white rounded-xl border border-gray-200 p-4">
      <h2 class="text-sm font-semibold mb-2">引用元ドキュメント</h2>
      <ul class="list-disc ml-5 space-y-1 text-sm">
        ${(k.docs || []).map(
          (d) =>
            `<li><a href="${d.href || "#"}" class="text-blue-600 hover:underline" target="_blank">${d.label}</a></li>`
        ).join("")}
      </ul>
    </section>
  </main>
</body>
</html>
  `.trim();

  win.document.open();
  win.document.write(html);
  win.document.close();
}

// ==============================
// モード切替
// ==============================
function setMode(newMode) {
  state.mode = newMode;

  if (state.mode === "auto") {
    modeAutoBtn.className = "px-3 py-1 bg-slate-900 text-white";
    modeManualBtn.className = "px-3 py-1 bg-white text-gray-600";
    btnFetch.disabled = true;
    btnPause.disabled = false;
  } else {
    modeAutoBtn.className = "px-3 py-1 bg-white text-gray-600";
    modeManualBtn.className = "px-3 py-1 bg-slate-900 text-white";
    btnFetch.disabled = false;
    btnPause.disabled = true;
  }
}

function initModeHandlers() {
  modeAutoBtn.addEventListener("click", () => setMode("auto"));
  modeManualBtn.addEventListener("click", () => setMode("manual"));

  btnPause.addEventListener("click", () => {
    if (state.mode !== "auto") return;
    state.autoUpdatesPaused = !state.autoUpdatesPaused;
    btnPause.textContent = state.autoUpdatesPaused ? "更新を再開" : "更新を停止";
  });

  btnFetch.addEventListener("click", () => {
    if (state.mode !== "manual") return;
    // 手動モードでは常に最新精度版（v2）を出す想定
    applySuggestion("v2");
  });
}

// ==============================
// 初期化
// ==============================
function initKnowledgeOpenButton() {
  if (!btnOpenKnowledgeTab) return;
  btnOpenKnowledgeTab.addEventListener("click", () => {
    openKnowledgeInNewTab();
  });
}

function init() {
  setMode("auto");
  initModeHandlers();
  initKnowledgeOpenButton();
  clearKnowledgeDetail();
  startUtteranceFlow();
}

window.addEventListener("DOMContentLoaded", init);
