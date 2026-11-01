const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item');

function showScreen(name) {
  screens.forEach((screen) => screen.classList.toggle('hidden', screen.id !== `screen-${name}`));
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.screenTarget === name));
  const phone = document.querySelector('.phone');
  const screen = document.querySelector(`#screen-${name}`);
  if (phone) phone.scrollTop = 0;
  if (screen) screen.scrollTop = 0;
}

document.querySelectorAll('[data-screen-target]').forEach((control) => {
  control.addEventListener('click', () => showScreen(control.dataset.screenTarget));
});

const reasonToggle = document.querySelector('.reason-toggle');
const reasonDetail = document.querySelector('#stylist-reason-detail');
if (reasonToggle && reasonDetail) {
  reasonToggle.addEventListener('click', () => {
    const expanded = reasonToggle.getAttribute('aria-expanded') === 'true';
    reasonDetail.hidden = expanded;
    reasonToggle.setAttribute('aria-expanded', String(!expanded));
    reasonToggle.childNodes[0].textContent = expanded ? '查看详细理由' : '收起';
  });
}

const toast = document.querySelector('.toast');
let toastTimer;
function showToast(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add('is-visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('is-visible'), 1800);
}

document.querySelectorAll('[data-profile-action]').forEach((control) => {
  control.addEventListener('click', () => showToast(`${control.dataset.profileAction}功能将在后续版本开放`));
});

let favorites = [];
let favoriteStore;
try {
  favoriteStore = MiudaStorage.createBrowserWardrobeStore();
  favorites = favoriteStore.getFavoriteIds();
} catch (_) {
  favoriteStore = null;
}


const store = favoriteStore;
const grid = document.querySelector('.wardrobe-grid');
const recent = document.querySelector('.recent-list');
function element(tag, className, text) {
  const node = document.createElement(tag); if (className) node.className = className;
  if (text !== undefined) node.textContent = text; return node;
}
function renderWardrobe() {
  try {
    if (!store) throw new Error('存储不可用');
    const items = store.getItems();
    document.querySelector('.big-number').textContent = items.length;
    document.querySelector('.wardrobe-heading p').textContent = items.length + ' 件衣物';
    ['top','bottom','outerwear','shoes'].forEach((category, i) => { document.querySelectorAll('.category-row b')[i].textContent = items.filter(item => item.category === category).length; });
    grid.replaceChildren(); recent.replaceChildren();
    [...items].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).forEach(item => {
      const card = element('article','wardrobe-card');
      const display = element(item.id === 'ivory-cardigan' ? 'button' : 'div','wardrobe-item');
      if (item.id === 'ivory-cardigan') { display.type = 'button'; display.addEventListener('click', () => showScreen('detail')); }
      const img = element('img','wardrobe-product'); img.src = item.imageUrl; img.alt = item.name;
      display.append(img, element('small','',item.color), element('strong','',item.name));
      const heart = element('button','wardrobe-heart'); heart.type = 'button';
      heart.innerHTML = '<svg aria-hidden="true"><use href="#i-heart"></use></svg>';
      function updateHeart() { const selected = favorites.includes(item.id); heart.setAttribute('aria-pressed', String(selected)); heart.setAttribute('aria-label', (selected ? '取消收藏' : '收藏') + item.name); }
      updateHeart(); heart.addEventListener('click', () => { try { favorites = store.setFavorite(item.id, !favorites.includes(item.id)); updateHeart(); } catch (_) { showToast('收藏保存失败，请检查浏览器存储'); } });
      card.append(display,heart); grid.append(card);
    });
    [...items].sort((a,b) => b.createdAt.localeCompare(a.createdAt)).slice(0,4).forEach(item => {
      const article = element('article'); const box = element('div','mini-clothing'); const img = element('img'); img.src=item.imageUrl; img.alt=item.name; box.append(img);
      const date = new Date(item.createdAt); article.append(box,element('small','',Number.isNaN(date.getTime()) ? '' : (date.getMonth()+1)+'月'+date.getDate()+'日')); recent.append(article);
    });
  } catch (_) { showToast('衣橱数据读取失败，请检查浏览器存储'); }
}
renderWardrobe();

const form = document.querySelector('#intake-form');
const preview = document.querySelector('#intake-preview');
const status = document.querySelector('#intake-status');
const message = document.querySelector('#intake-message');
const retry = document.querySelector('#intake-retry');
const fileInput = document.querySelector('#intake-file');
let selectedImage = null, sequence = 0;
async function recognize(image) {
  const request = ++sequence; selectedImage = image; preview.src = image;
  status.textContent = 'AI 识别中'; message.textContent = '正在识别衣物，请稍候'; form.hidden = true; retry.hidden = true;
  try {
    const [result] = await Promise.all([MiudaAI.analyzeClothing(image), new Promise(resolve => setTimeout(resolve, 400))]);
    if (request !== sequence) return;
    for (const key of ['name','category','color','styles','seasons','occasions','material']) form.elements[key].value = Array.isArray(result[key]) ? result[key].join('，') : (result[key] || '');
    status.textContent = '识别成功'; message.textContent = '请确认并修改衣物信息'; form.hidden = false; retry.hidden = false;
  } catch (_) { if (request !== sequence) return; status.textContent = '识别失败'; message.textContent = '请重试或选择其他图片'; retry.hidden = false; }
}
MiudaSeed.getSeedClothing().slice(0,3).forEach(item => {
  const button = element('button','sample-button'); button.type = 'button'; const img = element('img'); img.src=item.imageUrl; img.alt=''; button.append(img,element('span','',item.name));
  button.addEventListener('click', () => recognize(item.imageUrl)); document.querySelector('#intake-samples').append(button);
});
fileInput.addEventListener('change', () => {
  const file = fileInput.files[0]; if (!file) return;
  ++sequence; selectedImage = null; form.hidden = true; retry.hidden = true;
  if (!file.type.startsWith('image/')) { status.textContent='图片读取失败'; message.textContent='请选择图片文件'; fileInput.value=''; return; }
  const request = sequence; const reader = new FileReader();
  reader.onload = () => { if (request === sequence) recognize(reader.result); };
  reader.onerror = () => { if (request === sequence) { status.textContent='图片读取失败'; message.textContent='请选择其他图片'; } };
  reader.readAsDataURL(file); fileInput.value = '';
});
retry.addEventListener('click', () => { if (selectedImage) recognize(selectedImage); });
form.addEventListener('submit', event => {
  event.preventDefault(); if (!selectedImage) return;
  const value = key => form.elements[key].value.trim();
  const tags = key => value(key).split(/[,，]/).map(x => x.trim()).filter(Boolean);
  if (!value('name') || !value('color')) { message.textContent='请填写名称和颜色'; return; }
  const item = { id: 'clothing-' + (globalThis.crypto?.randomUUID?.() || Date.now() + '-' + Math.random().toString(36).slice(2)), imageUrl:selectedImage, createdAt:new Date().toISOString(), name:value('name'), category:value('category'), color:value('color'), styles:tags('styles'), seasons:tags('seasons'), occasions:tags('occasions'), material:value('material') };
  try { if (!store) throw new Error(); store.addItem(item); renderWardrobe(); showScreen('wardrobe'); showToast('已加入衣橱'); form.hidden=true; selectedImage=null; status.textContent='请选择一张图片'; message.textContent='选择样例或本地图片开始识别'; retry.hidden=true; }
  catch (_) { message.textContent='保存失败，请检查浏览器存储空间后重试'; showToast('保存失败，请检查浏览器存储空间'); }
});
