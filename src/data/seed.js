/* Seed items use the existing static-demo IDs so later screens can reuse them. */
(function (root) {
  const items = [
    { id: 'ivory-cardigan', name: '针织开衫', imageUrl: 'assets/products/ivory-cardigan.png', category: 'top', color: '奶油白', styles: ['通勤'], seasons: ['春', '秋'], occasions: ['通勤'], material: '针织', createdAt: '2026-04-10T00:00:00.000Z' },
    { id: 'light-blue-jeans', name: '牛仔裤', imageUrl: 'assets/products/light-blue-jeans.png', category: 'bottom', color: '浅蓝色', styles: ['休闲'], seasons: ['春', '秋'], occasions: ['日常'], material: '牛仔', createdAt: '2026-04-05T00:00:00.000Z' },
    { id: 'camel-trench', name: '风衣外套', imageUrl: 'assets/products/camel-trench.png', category: 'outerwear', color: '卡其色', styles: ['通勤'], seasons: ['春', '秋'], occasions: ['通勤'], createdAt: '2026-04-03T00:00:00.000Z' },
    { id: 'ivory-sneakers', name: '运动鞋', imageUrl: 'assets/products/ivory-sneakers.png', category: 'shoes', color: '米白色', styles: ['休闲'], seasons: ['春', '秋'], occasions: ['日常'], createdAt: '2026-04-02T00:00:00.000Z' },
    { id: 'brown-tote', name: '托特包', imageUrl: 'assets/products/brown-tote.png', category: 'bag', color: '深棕色', styles: ['通勤'], seasons: ['四季'], occasions: ['通勤'], createdAt: '2026-04-08T00:00:00.000Z' },
    { id: 'camel-utility-jacket', name: '短外套', imageUrl: 'assets/products/camel-utility-jacket.png', category: 'outerwear', color: '浅卡其色', styles: ['休闲'], seasons: ['春', '秋'], occasions: ['日常'], createdAt: '2026-04-01T00:00:00.000Z' },
    { id: 'striped-knit', name: '条纹针织衫', imageUrl: 'assets/products/striped-knit.png', category: 'top', color: '米白色', styles: ['休闲'], seasons: ['春', '秋'], occasions: ['日常'], material: '针织', createdAt: '2026-04-09T00:00:00.000Z' }
  ];

  function getSeedClothing() {
    return JSON.parse(JSON.stringify(items));
  }

  const api = { getSeedClothing };
  root.MiudaSeed = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(globalThis);
