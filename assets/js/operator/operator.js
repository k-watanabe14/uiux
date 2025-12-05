// assets/js/operator/operator.js

// ==============================
// データラッパ (operatorData.js 側の OPERATOR_DATA を使用)
// ==============================
const DATA =
  (typeof window !== "undefined" && window.OPERATOR_DATA)
    ? window.OPERATOR_DATA
    : {
        utterances: [],
        suggestionVersions: {}
      };

// ナレッジデータ (knowledgeData.js の KNOWLEDGE_DATA.items を利用)
const KNOWLEDGE_ITEMS =
  (typeof window !== "undefined" &&
    window.KNOWLEDGE_DATA &&
    Array.isArray(window.KNOWLEDGE_DATA.items))
    ? window.KNOWLEDGE_DATA.items
    : [];

// ==============================
// 簡易ユーティリティ
// ==============================
const $  = (sel) => document.querySelector(sel);
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

const btnOpenKnowledgeTab  = $("#btn-open-tab");

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
        triggerAISuggestion("v1");
        state.lastAutoVersion = "v1";
      } else if (state.utteranceIndex === 6 && state.lastAutoVersion !== "v2") {
        triggerAISuggestion("v2");
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
      item.active ? "font-semibold text-slate-900" : "text-blue-700"
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

  // 1. 既存状態をスナップショット
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

  // 2. 新しいサジェストを適用
  // followups
  let nextFollowups = (v.followups || []).map((item, idx) => {
    const id   = item.id || `f-${versionKey}-${idx + 1}`;
    const prev = prevFollowupMap[id];
    const wasPinned = !!(prev && prev.pinned);
    const pinned    = wasPinned || !!item.pinned;

    return {
      id,
      text: pinned && prev ? prev.text : (item.text || ""),
      pinned
    };
  });

  prevPinnedFollowups.forEach((p) => {
    if (!nextFollowups.some((x) => x.id === p.id)) {
      nextFollowups.unshift({
        id: p.id,
        text: p.text,
        pinned: true
      });
    }
  });

  // causes
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

  // sources
  let nextSources = (v.sources || []).map((item, idx) => {
    const id   = item.id || `s-${versionKey}-${idx + 1}`;
    const prev = prevSourceMap[id];
    const wasPinned = !!(prev && prev.pinned);
    const pinned    = wasPinned || !!item.pinned;

    return {
      id,
      label: pinned && prev ? prev.label : (item.label || item.text || ""),
      pinned,
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

  // 3. レンダリング & ナレッジ詳細は自動更新しない
  renderFollowups();
  renderCauses();
  renderScript(v.script);
  renderSources();

  clearKnowledgeDetail(); // 引用元ナレッジをクリックするまで詳細は表示しない
}

// --- ローディング後にAI示唆を表示 ---
function triggerAISuggestion(versionKey) {
  // ① 先にローディング表示
  renderLoadingState();

  // ② 疑似API待ち（実運用では実APIの await に置換）
  setTimeout(() => {
    applySuggestion(versionKey);
  }, 800); // 300〜800msで調整可
}

// ==============================
// ナレッジ詳細
// ==============================
function applyKnowledgeDetail(id) {
  // knowledgeData.js から該当IDのナレッジを取得
  const k = KNOWLEDGE_ITEMS.find((item) => item.id === id);
  if (!k) return;

  state.selectedKnowledgeId = id;

  // ナレッジが選択されたのでボタンを有効化
  if (btnOpenKnowledgeTab) {
    btnOpenKnowledgeTab.disabled = false;
  }

  knowledgeSubtitleEl.textContent = k.subtitle || k.title || "";

  // 概要
  detailOverviewEl.textContent = k.overview || "";

  // 症状と想定される原因
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

  // 関連資料
  const ulDocs = document.createElement("ul");
  ulDocs.className = "list-disc ml-5 space-y-1";
  (k.docs || []).forEach((d) => {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = d.href || "#";
    a.textContent = d.label || d.href || "関連資料";
    a.className = "text-blue-600 hover:underline";
    a.target = "_blank";
    li.appendChild(a);
    ulDocs.appendChild(li);
  });
  detailDocsEl.innerHTML = "";
  detailDocsEl.appendChild(ulDocs);
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

  // ナレッジ未選択なのでボタンは無効化
  if (btnOpenKnowledgeTab) {
    btnOpenKnowledgeTab.disabled = true;
  }
}

// 別タブでナレッジ詳細を開く
function openKnowledgeInNewTab() {
  const id = state.selectedKnowledgeId;
  if (!id) return;

  window.open(`./knowledge_detail.html?id=${encodeURIComponent(id)}`, "_blank");
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
    triggerAISuggestion("v2");
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

// ==============================
// AI出力中（ローディング）表示
// ==============================
function renderLoadingState() {
  //
  // 1) 追加で確認すべき質問（followups）
  //
  if (state.followups && state.followups.length) {
    followupContentEl.innerHTML = "";

    const ul = document.createElement("ul");
    ul.className = "space-y-1";

    // ピン留め済みだけを描画
    const pinnedFollowups = sortPinnedFirst(state.followups).filter((i) => i.pinned);

    pinnedFollowups.forEach((item) => {
      const li = document.createElement("li");
      li.dataset.id = item.id;

      const row = document.createElement("div");
      row.className = [
        "flex items-start justify-between gap-2 px-2 py-1 rounded",
        "bg-yellow-50"
      ].join(" ");

      const text = document.createElement("span");
      text.className = "text-sm";
      text.textContent = item.text;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = [
        "ml-2 shrink-0 text-xs px-2 py-1 rounded-full border",
        "border-yellow-400 bg-yellow-100 text-yellow-700"
      ].join(" ");
      btn.textContent = "📌";
      btn.title = "ピン留めを解除";

      btn.addEventListener("click", () => {
        item.pinned = !item.pinned;
        // ローディング中も状態に応じて再描画
        renderLoadingState();
      });

      row.appendChild(text);
      row.appendChild(btn);
      li.appendChild(row);
      ul.appendChild(li);
    });

    // 未ピン部分のローディングプレースホルダ
    const loadingLi = document.createElement("li");
    loadingLi.innerHTML =
      `<div class="px-2 py-1 text-xs text-gray-400">AI出力中…</div>`;
    ul.appendChild(loadingLi);

    followupContentEl.appendChild(ul);
  } else {
    // まだ何も無い場合は全体をローディング表示
    followupContentEl.innerHTML =
      `<div class="px-2 py-1 text-xs text-gray-400">AI出力中…</div>`;
  }

  //
  // 2) 推定される原因候補（causes）
  //
  if (state.causes && state.causes.length) {
    causesContentEl.innerHTML = "";

    const ul = document.createElement("ul");
    ul.className = "space-y-1";

    const pinnedCauses = sortPinnedFirst(state.causes).filter((i) => i.pinned);

    pinnedCauses.forEach((item) => {
      const li = document.createElement("li");
      li.dataset.id = item.id;

      const row = document.createElement("div");
      row.className = [
        "flex items-start justify-between gap-2 px-2 py-1 rounded",
        "bg-yellow-50"
      ].join(" ");

      const text = document.createElement("span");
      text.className = "text-sm";
      text.textContent = item.text;

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = [
        "ml-2 shrink-0 text-xs px-2 py-1 rounded-full border",
        "border-yellow-400 bg-yellow-100 text-yellow-700"
      ].join(" ");
      btn.textContent = "📌";
      btn.title = "ピン留めを解除";

      btn.addEventListener("click", () => {
        item.pinned = !item.pinned;
        renderLoadingState();
      });

      row.appendChild(text);
      row.appendChild(btn);
      li.appendChild(row);
      ul.appendChild(li);
    });

    const loadingLi = document.createElement("li");
    loadingLi.innerHTML =
      `<div class="px-2 py-1 text-xs text-gray-400">AI出力中…</div>`;
    ul.appendChild(loadingLi);

    causesContentEl.appendChild(ul);
  } else {
    causesContentEl.innerHTML =
      `<div class="px-2 py-1 text-xs text-gray-400">AI出力中…</div>`;
  }

  //
  // 3) 一次案内文（トーク例）
  //
  if (scriptContentEl) {
    scriptContentEl.innerHTML =
      `<div class="px-2 py-1 text-xs text-gray-400">AI出力中…</div>`;
  }

  //
  // 4) 引用元ナレッジ（sources）
  //
  if (state.sources && state.sources.length) {
    sourcesContentEl.innerHTML = "";

    const ul = document.createElement("ul");
    ul.className = "space-y-1 text-sm";

    const pinnedSources = sortPinnedFirst(state.sources).filter((i) => i.pinned);

    pinnedSources.forEach((item) => {
      const li = document.createElement("li");

      // ★ row 全体をハイライト対象にする
      const row = document.createElement("div");
      row.className = [
        "flex items-center justify-between gap-2 px-2 py-1 rounded border",
        "bg-yellow-50 border-yellow-400"
      ].join(" ");

      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.knowledgeId = item.id;
      btn.className = "w-full text-left text-sm text-gray-900";
      btn.textContent = item.label || item.id;

      btn.addEventListener("click", () => {
        state.sources.forEach((s) => {
          s.active = s.id === item.id;
        });
        renderLoadingState();
        applyKnowledgeDetail(item.id);
      });

      const pinBtn = document.createElement("button");
      pinBtn.type = "button";
      pinBtn.className =
        "ml-2 shrink-0 text-xs px-2 py-1 rounded-full border border-yellow-400 bg-yellow-100 text-yellow-700";
      pinBtn.textContent = "📌";
      pinBtn.title = "ピン留めを解除";

      pinBtn.addEventListener("click", (ev) => {
        ev.stopPropagation();
        item.pinned = false;
        renderLoadingState();
      });

      row.appendChild(btn);
      row.appendChild(pinBtn);
      li.appendChild(row);
      ul.appendChild(li);
    });

    // ローディング行
    const loadingLi = document.createElement("li");
    loadingLi.innerHTML =
      `<div class="px-2 py-1 text-xs text-gray-400">AI出力中…</div>`;
    ul.appendChild(loadingLi);

    sourcesContentEl.appendChild(ul);
  } else {
    sourcesContentEl.innerHTML =
      `<div class="px-2 py-1 text-xs text-gray-400">AI出力中…</div>`;
  }
}

