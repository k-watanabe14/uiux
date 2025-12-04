// ピン留め関連の共通ユーティリティ
// 要素の形式: { id: string, text: string, pinned: boolean, ... }

window.PinUtils = {
  togglePin(list, id) {
    return list.map((item) =>
      item.id === id ? { ...item, pinned: !item.pinned } : item
    );
  },

  sortByPinned(list) {
    return [...list].sort((a, b) => {
      if (a.pinned === b.pinned) return 0;
      return a.pinned ? -1 : 1;
    });
  }
};
