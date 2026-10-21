/* Keep local data independent from UI and fail safely if storage is unreadable. */
(function (root) {
  const STORAGE_KEY = 'miuda-wardrobe-items-v1';
  const FAVORITES_KEY = 'miuda-wardrobe-favorites-v1';
  const categories = new Set(['top', 'bottom', 'outerwear', 'dress', 'shoes', 'bag', 'accessory']);

  function validateItems(items) {
    if (!Array.isArray(items)) throw new Error('衣橱数据格式无效');
    const ids = new Set();
    for (const item of items) {
      if (!item || typeof item !== 'object' || Array.isArray(item) ||
          !['id', 'name', 'imageUrl', 'color', 'createdAt'].every((key) => typeof item[key] === 'string' && item[key].trim()) ||
          !categories.has(item.category) || ids.has(item.id) ||
          !['styles', 'seasons', 'occasions'].every((key) => Array.isArray(item[key]) && item[key].every((value) => typeof value === 'string'))) {
        throw new Error('衣橱数据包含无效或重复的衣物');
      }
      ids.add(item.id);
    }
  }

  function createWardrobeStore(storage, getSeedClothing) {
    if (!storage || typeof storage.getItem !== 'function' || typeof storage.setItem !== 'function' || typeof getSeedClothing !== 'function') {
      throw new Error('衣橱存储不可用');
    }

    function saveItems(items) {
      validateItems(items);
      storage.setItem(STORAGE_KEY, JSON.stringify(items));
    }

    function getItems() {
      const saved = storage.getItem(STORAGE_KEY);
      if (saved === null) {
        const seed = getSeedClothing();
        saveItems(seed);
        return seed;
      }
      let items;
      try {
        items = JSON.parse(saved);
      } catch (_) {
        throw new Error('衣橱数据无法解析，请先备份原始数据');
      }
      validateItems(items);
      return items;
    }

    function addItem(item) {
      const items = getItems();
      saveItems([...items, item]);
      return item;
    }

    function updateItem(id, changes) {
      const items = getItems();
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) throw new Error('未找到要更新的衣物');
      if (!changes || typeof changes !== 'object' || Array.isArray(changes) ||
          (Object.prototype.hasOwnProperty.call(changes, 'id') && changes.id !== id)) {
        throw new Error('衣物更新数据无效');
      }
      const updated = { ...items[index], ...changes };
      items[index] = updated;
      saveItems(items);
      return updated;
    }

    function deleteItem(id) {
      const items = getItems();
      const index = items.findIndex((item) => item.id === id);
      if (index < 0) throw new Error('未找到要删除的衣物');
      const [removed] = items.splice(index, 1);
      saveItems(items);
      return removed;
    }

    function getFavoriteIds() {
      const saved = storage.getItem(FAVORITES_KEY);
      if (saved === null) return [];
      let ids;
      try { ids = JSON.parse(saved); } catch (_) { throw new Error('收藏数据无法解析，请先备份原始数据'); }
      if (!Array.isArray(ids) || !ids.every((id) => typeof id === 'string' && id.trim())) {
        throw new Error('收藏数据格式无效，请先备份原始数据');
      }
      return [...new Set(ids)];
    }

    function setFavorite(id, selected) {
      if (typeof id !== 'string' || !id.trim() || typeof selected !== 'boolean') throw new Error('收藏参数无效');
      const ids = getFavoriteIds();
      const next = selected ? [...new Set([...ids, id])] : ids.filter((value) => value !== id);
      storage.setItem(FAVORITES_KEY, JSON.stringify(next));
      return next;
    }

    return { getItems, saveItems, addItem, updateItem, deleteItem, getFavoriteIds, setFavorite };
  }

  function createBrowserWardrobeStore() {
    return createWardrobeStore(root.localStorage, root.MiudaSeed.getSeedClothing);
  }

  const api = { STORAGE_KEY, FAVORITES_KEY, createWardrobeStore, createBrowserWardrobeStore };
  root.MiudaStorage = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
