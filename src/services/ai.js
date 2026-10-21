/* Predictable demo responses; no images or data are sent to an external service. */
(function (root) {
  async function analyzeClothing(image) {
    if (!image) throw new Error('请选择衣物图片');
    return { name: '针织开衫', category: 'top', color: '奶油白', styles: ['通勤'], seasons: ['春', '秋'], occasions: ['通勤'], material: '针织' };
  }

  async function generateOutfit(input, items) {
    if (!Array.isArray(items)) throw new Error('衣橱数据无效');
    const required = [['top', '上衣'], ['bottom', '下装'], ['shoes', '鞋履']];
    const missing = required.filter(([category]) => !items.some((item) => item && item.category === category));
    if (missing.length) throw new Error(`衣物不足，还缺少：${missing.map((entry) => entry[1]).join('、')}`);
    const chosen = required.map(([category]) => items.find((item) => item.category === category));
    return { id: 'mock-outfit', itemIds: chosen.map((item) => item.id), title: '日常穿搭', occasion: (input && input.occasion) || '日常', reason: '根据衣橱中的现有衣物生成的演示搭配。' };
  }

  async function generateTryOn(input) {
    if (!input || !Array.isArray(input.itemIds) || !input.itemIds.length) throw new Error('请选择试衣衣物');
    return { id: 'mock-tryon', itemIds: [...input.itemIds], personImageUrl: input.personImageUrl || '', status: 'success', resultImageUrl: 'assets/tryon/commute-look-v1.png' };
  }

  const api = { analyzeClothing, generateOutfit, generateTryOn };
  root.MiudaAI = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
