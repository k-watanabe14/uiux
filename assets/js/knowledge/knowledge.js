// assets/js/knowledge/knowledge.js

(function () {
  const DATA =
    (typeof window !== "undefined" && window.KNOWLEDGE_DATA && Array.isArray(window.KNOWLEDGE_DATA.items))
      ? window.KNOWLEDGE_DATA.items
      : [];

  // DOM 取得
  const listBodyEl = document.getElementById("knowledge-list-body");
  const listEmptyEl = document.getElementById("knowledge-list-empty");

  const searchInputEl = document.getElementById("knowledge-search-input");
  const statusFilterEl = document.getElementById("knowledge-status-filter");

  const detailSubtitleEl = document.getElementById("knowledge-detail-subtitle");
  const detailStatusBadgeEl = document.getElementById("knowledge-detail-status-badge");
  const detailMetaEl = document.getElementById("knowledge-detail-meta");

  const detailOverviewEl = document.getElementById("detail-overview");
  const detailSymptomsEl = document.getElementById("detail-symptoms");
  const detailFlowEl = document.getElementById("detail-flow");
  const detailDocsEl = document.getElementById("detail-docs");

  const editBtnEl = document.getElementById("knowledge-detail-edit-btn");

  let currentSelectedId = null;
  let filteredItems = [...DATA];

  // =========================
  // ユーティリティ
  // =========================
  function $(sel, base = document) {
    return base.querySelector(sel);
  }

  function getQueryId() {
    const url = new URL(window.location.href);
    return url.searchParams.get("id");
  }

  // =========================
  // 一覧レンダリング
  // =========================
  function renderList() {
    listBodyEl.innerHTML = "";

    if (!filteredItems.length) {
      if (listEmptyEl) listEmptyEl.classList.remove("hidden");
      return;
    }
    if (listEmptyEl) listEmptyEl.classList.add("hidden");

    filteredItems.forEach((item) => {
      const tr = document.createElement("tr");
      tr.dataset.id = item.id;

      const isActive = item.id === currentSelectedId;

      tr.className = [
        "cursor-pointer",
        isActive ? "bg-slate-900 text-white" : "hover:bg-slate-50"
      ].join(" ");

      tr.innerHTML = `
        <td class="px-3 py-2 align-top">
          <div class="font-medium text-[12px] ${isActive ? "text-white" : "text-gray-900"}">
            ${item.title}
          </div>
          <div class="text-[11px] mt-0.5 ${isActive ? "text-slate-200" : "text-gray-500"}">
            ${item.series || ""}
          </div>
        </td>
        <td class="px-2 py-2 align-top whitespace-nowrap">
          <span class="text-[11px] ${isActive ? "text-slate-200" : "text-gray-700"}">
            ${item.errorCode || "-"}
          </span>
        </td>
        <td class="px-2 py-2 align-top whitespace-nowrap">
          <span class="inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium ${
            item.kind === "FAQ"
              ? (isActive ? "bg-blue-500 text-white" : "bg-blue-50 text-blue-700")
              : item.kind === "手順書"
              ? (isActive ? "bg-emerald-500 text-white" : "bg-emerald-50 text-emerald-700")
              : (isActive ? "bg-gray-600 text-white" : "bg-gray-100 text-gray-700")
          }">
            ${item.kind || "-"}
          </span>
        </td>
        <td class="px-2 py-2 align-top whitespace-nowrap">
          <div class="text-[11px] ${isActive ? "text-slate-200" : "text-gray-600"}">
            ${item.updatedAt || ""}
          </div>
          <div class="text-[11px] mt-0.5">
            ${
              item.statusLabel
                ? `<span class="${
                    isActive
                      ? "px-1.5 py-0.5 rounded-full bg-slate-800 text-[10px] text-slate-100"
                      : "px-1.5 py-0.5 rounded-full bg-slate-100 text-[10px] text-slate-700"
                  }">${item.statusLabel}</span>`
                : ""
            }
          </div>
        </td>
      `;

      tr.addEventListener("click", () => {
        selectKnowledge(item.id);
      });

      listBodyEl.appendChild(tr);
    });
  }

  // =========================
  // 詳細レンダリング
  // =========================
  function renderDetail(item) {
    if (!item) {
      currentSelectedId = null;
      detailSubtitleEl.textContent = "左の一覧からナレッジを選択してください。";
      detailMetaEl.textContent = "";
      detailStatusBadgeEl.classList.add("hidden");

      detailOverviewEl.textContent = "まだナレッジが選択されていません。";
      detailSymptomsEl.textContent = "まだナレッジが選択されていません。";
      detailFlowEl.textContent = "まだナレッジが選択されていません。";
      detailDocsEl.textContent = "まだナレッジが選択されていません。";

      if (editBtnEl) {
        editBtnEl.disabled = true;
        editBtnEl.onclick = null;
      }
      return;
    }

    currentSelectedId = item.id;

    // サブタイトル
    detailSubtitleEl.textContent = item.subtitle || item.title || "";

    // ステータスバッジ
    if (item.statusLabel) {
      detailStatusBadgeEl.classList.remove("hidden");
      detailStatusBadgeEl.textContent = item.statusLabel || "";
      if (item.status === "published") {
        detailStatusBadgeEl.className =
          "text-[11px] px-2 py-0.5 rounded-full border border-emerald-400 text-emerald-700 bg-emerald-50";
      } else if (item.status === "draft") {
        detailStatusBadgeEl.className =
          "text-[11px] px-2 py-0.5 rounded-full border border-amber-400 text-amber-700 bg-amber-50";
      } else {
        detailStatusBadgeEl.className =
          "text-[11px] px-2 py-0.5 rounded-full border border-gray-300 text-gray-600 bg-white";
      }
    } else {
      detailStatusBadgeEl.classList.add("hidden");
    }

    // メタ情報
    const metaParts = [];
    if (item.errorCode && item.errorCode !== "-") {
      metaParts.push(`エラーコード: ${item.errorCode}`);
    }
    if (item.series) {
      metaParts.push(`対象機種・シリーズ: ${item.series}`);
    }
    if (item.updatedAt) {
      metaParts.push(`最終更新: ${item.updatedAt}`);
    }
    if (item.tags && item.tags.length) {
      metaParts.push(`タグ: ${item.tags.join(" / ")}`);
    }
    detailMetaEl.textContent = metaParts.join("　|　");

    // 概要
    detailOverviewEl.textContent = item.overview || "";

    // 症状と想定される原因
    detailSymptomsEl.innerHTML = "";
    if (item.symptoms && item.symptoms.length) {
      const ul = document.createElement("ul");
      ul.className = "list-disc ml-5 space-y-1 text-sm";
      item.symptoms.forEach((s) => {
        const li = document.createElement("li");
        li.textContent = s;
        ul.appendChild(li);
      });
      detailSymptomsEl.appendChild(ul);
    } else {
      detailSymptomsEl.textContent = "症状情報が登録されていません。";
    }

    // 一次対応フロー
    detailFlowEl.innerHTML = "";
    if (item.flow && item.flow.length) {
      const ol = document.createElement("ol");
      ol.className = "list-decimal ml-5 space-y-1 text-sm";
      item.flow.forEach((s) => {
        const li = document.createElement("li");
        li.textContent = s;
        ol.appendChild(li);
      });
      detailFlowEl.appendChild(ol);
    } else {
      detailFlowEl.textContent = "一次対応フローが登録されていません。";
    }

    // 関連ドキュメント
    detailDocsEl.innerHTML = "";
    if (item.docs && item.docs.length) {
      const ul = document.createElement("ul");
      ul.className = "list-disc ml-5 space-y-1 text-sm";
      item.docs.forEach((d) => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = d.href || "#";
        a.textContent = d.label || d.href || "関連資料";
        a.className = "text-blue-600 hover:underline";
        a.target = "_blank";
        li.appendChild(a);
        ul.appendChild(li);
      });
      detailDocsEl.appendChild(ul);
    } else {
      detailDocsEl.textContent = "関連ドキュメントは登録されていません。";
    }

    // 編集ボタン
    if (editBtnEl) {
      editBtnEl.disabled = false;
      editBtnEl.onclick = () => {
        // まだ実装していないので、ひとまず遷移だけ
        window.location.href = `/knowledge_edit.html?id=${encodeURIComponent(item.id)}`;
      };
    }

    // 一覧側の選択状態を更新
    renderList();
  }

  // =========================
  // 選択処理
  // =========================
  function selectKnowledge(id) {
    const item = DATA.find((x) => x.id === id);
    renderDetail(item);
  }

  // =========================
  // フィルタリング
  // =========================
  function applyFilter() {
    const keyword = (searchInputEl?.value || "").trim().toLowerCase();
    const status = statusFilterEl?.value || "";

    filteredItems = DATA.filter((item) => {
      if (status && item.status !== status) return false;

      if (keyword) {
        const haystack = [
          item.title,
          item.errorCode,
          item.series,
          (item.tags || []).join(" "),
          item.subtitle
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(keyword)) return false;
      }

      return true;
    });

    // 現在選択中のIDがフィルタ後になければクリア
    if (!filteredItems.some((x) => x.id === currentSelectedId)) {
      renderDetail(null);
    }

    renderList();
  }

  // =========================
  // 初期化
  // =========================
  function init() {
    if (!DATA.length) {
      if (listEmptyEl) listEmptyEl.classList.remove("hidden");
      return;
    }

    // イベント
    if (searchInputEl) {
      searchInputEl.addEventListener("input", () => {
        applyFilter();
      });
    }
    if (statusFilterEl) {
      statusFilterEl.addEventListener("change", () => {
        applyFilter();
      });
    }

    // 初期フィルタ
    filteredItems = [...DATA];
    renderList();

    // 初期選択: URL パラメータ id があればそれ、なければ先頭
    const initialId = getQueryId() || (DATA[0] && DATA[0].id);
    if (initialId) {
      selectKnowledge(initialId);
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
