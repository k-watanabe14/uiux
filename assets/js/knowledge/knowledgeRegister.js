// assets/js/knowledge/knowledgeRegister.js
(function () {
  // DOM 取得
  const fileInput     = document.getElementById("kr-file");
  const titleInput    = document.getElementById("kr-title");
  const memoInput     = document.getElementById("kr-memo");

  const fileNameEl    = document.getElementById("kr-file-name");
  const fileSizeEl    = document.getElementById("kr-file-size");
  const fileTypeEl    = document.getElementById("kr-file-type");
  const previewEl     = document.getElementById("kr-preview");

  const backBtn       = document.getElementById("kr-back-btn");
  const draftBtn      = document.getElementById("kr-draft-btn");
  const submitBtn     = document.getElementById("kr-submit-btn");

  function formatSize(bytes) {
    if (!bytes && bytes !== 0) return "-";
    if (bytes < 1024) return `${bytes} B`;
    const kb = bytes / 1024;
    if (kb < 1024) return `${kb.toFixed(1)} KB`;
    const mb = kb / 1024;
    return `${mb.toFixed(1)} MB`;
  }

  // ファイル選択時の情報更新
  function handleFileChange() {
    const file = fileInput.files && fileInput.files[0];
    if (!file) {
      fileNameEl.textContent = "ファイル名：未選択";
      fileSizeEl.textContent = "ファイルサイズ：-";
      fileTypeEl.textContent = "種別：-";
      previewEl.textContent =
        "ファイルをアップロードすると、ここにテキスト抜粋やサマリを表示する想定です。";
      return;
    }

    fileNameEl.textContent = `ファイル名：${file.name}`;
    fileSizeEl.textContent = `ファイルサイズ：${formatSize(file.size)}`;
    fileTypeEl.textContent = `種別：${file.type || "不明"}`;

    // プレビューはダミー文言のみ差し替え
    previewEl.textContent =
      `「${file.name}」が選択されています。実際の環境では、ここにAIによるサマリや重要箇所の抜粋を表示します。`;
  }

  // 下書き保存（ダミー）
  function handleDraftSave() {
    const title = (titleInput.value || "").trim();
    if (!title) {
      alert("タイトルを入力してください。");
      titleInput.focus();
      return;
    }
    alert("ダミー：下書き保存が完了しました。（実際の保存処理は未実装です）");
  }

  // 登録（ダミー）
  function handleSubmit() {
    const title = (titleInput.value || "").trim();
    if (!title) {
      alert("タイトルを入力してください。");
      titleInput.focus();
      return;
    }

    const memo = (memoInput.value || "").trim();

    // 実際にはここで API 呼び出し等を行う想定
    console.log("[Knowledge Register] submit payload (dummy)", {
      title,
      memo,
    });

    alert("ダミー：ナレッジの登録が完了しました。\n一覧画面に戻ります。");
    window.location.href = "./knowledge.html";
  }

  function init() {
    if (fileInput) {
      fileInput.addEventListener("change", handleFileChange);
    }
    if (backBtn) {
      backBtn.addEventListener("click", () => history.back());
    }
    if (draftBtn) {
      draftBtn.addEventListener("click", handleDraftSave);
    }
    if (submitBtn) {
      submitBtn.addEventListener("click", handleSubmit);
    }
  }

  window.addEventListener("DOMContentLoaded", init);
})();
