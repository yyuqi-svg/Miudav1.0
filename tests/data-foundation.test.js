const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { getSeedClothing } = require('../src/data/seed.js');
const { STORAGE_KEY, FAVORITES_KEY, createWardrobeStore } = require('../src/data/storage.js');
const ai = require('../src/services/ai.js');

function memoryStorage() {
  const data = new Map();
  return {
    getItem(key) { return data.has(key) ? data.get(key) : null; },
    setItem(key, value) { data.set(key, String(value)); }
  };
}

test('样例数据独立、ID 唯一且图片存在', () => {
  const first = getSeedClothing();
  const second = getSeedClothing();
  assert.equal(new Set(first.map((item) => item.id)).size, first.length);
  assert.ok(first.length >= 3);
  for (const item of first) assert.ok(fs.existsSync(path.join(__dirname, '..', item.imageUrl)));
  first[0].styles.push('测试');
  assert.ok(!second[0].styles.includes('测试'));
});

test('首次使用初始化样例，保存后可在新实例中读取', () => {
  const storage = memoryStorage();
  const store = createWardrobeStore(storage, getSeedClothing);
  const items = store.getItems();
  const added = { ...items[0], id: 'new-item', name: '新衣物' };
  store.saveItems([...items, added]);
  const afterReload = createWardrobeStore(storage, getSeedClothing).getItems();
  assert.equal(afterReload.at(-1).name, '新衣物');
  assert.equal(afterReload.length, items.length + 1);
});

test('已有空衣橱不会被样例数据重新填充', () => {
  const storage = memoryStorage();
  const store = createWardrobeStore(storage, getSeedClothing);
  store.saveItems([]);
  assert.deepEqual(createWardrobeStore(storage, getSeedClothing).getItems(), []);
});

test('单件衣物可新增、更新和删除，并在新实例中读取', () => {
  const storage = memoryStorage();
  const store = createWardrobeStore(storage, getSeedClothing);
  const initial = store.getItems();
  const item = { ...initial[0], id: 'crud-item', name: '新增衣物' };
  store.addItem(item);
  store.updateItem(item.id, { color: '粉色' });
  const reloaded = createWardrobeStore(storage, getSeedClothing);
  assert.equal(reloaded.getItems().find((entry) => entry.id === item.id).color, '粉色');
  reloaded.deleteItem(item.id);
  assert.equal(store.getItems().length, initial.length);
  assert.ok(!store.getItems().some((entry) => entry.id === item.id));
});

test('无效的单件操作不会改变已有数据', () => {
  const storage = memoryStorage();
  const store = createWardrobeStore(storage, getSeedClothing);
  const items = store.getItems();
  const before = storage.getItem(STORAGE_KEY);
  assert.throws(() => store.addItem(items[0]), /无效或重复/);
  assert.throws(() => store.updateItem(items[0].id, { id: 'other' }), /无效/);
  assert.throws(() => store.updateItem('missing', { color: '粉色' }), /未找到/);
  assert.throws(() => store.deleteItem('missing'), /未找到/);
  assert.equal(storage.getItem(STORAGE_KEY), before);
});

test('初始化衣物数据不覆盖已有收藏记录', () => {
  const storage = memoryStorage();
  const favoriteKey = 'miuda-wardrobe-favorites-v1';
  storage.setItem(favoriteKey, JSON.stringify(['ivory-cardigan']));
  const store = createWardrobeStore(storage, getSeedClothing);
  assert.ok(store.getItems().some((item) => item.id === 'ivory-cardigan'));
  assert.equal(storage.getItem(favoriteKey), '["ivory-cardigan"]');
});

test('收藏兼容旧数据，跨实例保存和取消', () => {
  const storage = memoryStorage();
  storage.setItem(FAVORITES_KEY, JSON.stringify(['ivory-cardigan']));
  const first = createWardrobeStore(storage, getSeedClothing);
  assert.deepEqual(first.getFavoriteIds(), ['ivory-cardigan']);
  first.setFavorite('light-blue-jeans', true);
  const second = createWardrobeStore(storage, getSeedClothing);
  assert.deepEqual(second.getFavoriteIds(), ['ivory-cardigan', 'light-blue-jeans']);
  second.setFavorite('ivory-cardigan', false);
  assert.deepEqual(first.getFavoriteIds(), ['light-blue-jeans']);
});

test('损坏收藏数据不会被覆盖', () => {
  const storage = memoryStorage();
  storage.setItem(FAVORITES_KEY, '{broken');
  const store = createWardrobeStore(storage, getSeedClothing);
  assert.throws(() => store.setFavorite('ivory-cardigan', true), /无法解析/);
  assert.equal(storage.getItem(FAVORITES_KEY), '{broken');
});

test('Mock AI 接口提供预置结果并只使用传入衣物', async () => {
  assert.equal((await ai.analyzeClothing('demo-image')).category, 'top');
  await assert.rejects(ai.analyzeClothing(null), /请选择/);
  const wardrobe = getSeedClothing();
  const outfit = await ai.generateOutfit({ occasion: '通勤' }, wardrobe);
  assert.equal(outfit.occasion, '通勤');
  assert.ok(outfit.itemIds.every((id) => wardrobe.some((item) => item.id === id)));
  await assert.rejects(ai.generateOutfit({}, wardrobe.filter((item) => item.category !== 'shoes')), /鞋履/);
  const result = await ai.generateTryOn({ itemIds: outfit.itemIds });
  assert.equal(result.status, 'success');
  assert.ok(fs.existsSync(path.join(__dirname, '..', result.resultImageUrl)));
  await assert.rejects(ai.generateTryOn({ itemIds: [] }), /请选择/);
});

test('损坏的数据和不合法的保存不会覆盖原始内容', () => {
  const storage = memoryStorage();
  storage.setItem(STORAGE_KEY, '{broken');
  const store = createWardrobeStore(storage, getSeedClothing);
  assert.throws(() => store.getItems(), /无法解析/);
  assert.equal(storage.getItem(STORAGE_KEY), '{broken');
  const items = getSeedClothing();
  assert.throws(() => store.saveItems([items[0], items[0]]), /无效或重复/);
  assert.equal(storage.getItem(STORAGE_KEY), '{broken');
});

test('存储不可用时明确报告错误', () => {
  const store = createWardrobeStore({ getItem() { throw new Error('存储被禁用'); }, setItem() {} }, getSeedClothing);
  assert.throws(() => store.getItems(), /存储被禁用/);
  const full = createWardrobeStore({ getItem() { return null; }, setItem() { throw new Error('空间不足'); } }, getSeedClothing);
  assert.throws(() => full.getItems(), /空间不足/);
});
