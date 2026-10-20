const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item');

function showScreen(name) {
  screens.forEach((screen) => screen.classList.toggle('hidden', screen.id !== `screen-${name}`));
  navItems.forEach((item) => item.classList.toggle('active', item.dataset.screenTarget === name));
  document.querySelector('.phone').scrollTop = 0;
}

document.querySelectorAll('[data-screen-target]').forEach((control) => {
  control.addEventListener('click', () => showScreen(control.dataset.screenTarget));
});

const reasonToggle = document.querySelector('.reason-toggle');
const reasonDetail = document.querySelector('#stylist-reason-detail');
reasonToggle.addEventListener('click', () => {
  const expanded = reasonToggle.getAttribute('aria-expanded') === 'true';
  reasonDetail.hidden = expanded;
  reasonToggle.setAttribute('aria-expanded', String(!expanded));
  reasonToggle.textContent = expanded ? '查看详细理由' : '收起';
});

const favoriteKey = 'miuda-wardrobe-favorites-v1';
let favorites = [];
try {
  const saved = JSON.parse(localStorage.getItem(favoriteKey) || '[]');
  if (Array.isArray(saved)) favorites = saved.filter((item) => typeof item === 'string');
} catch (_) {
  // The demo still works in memory if browser storage is unavailable.
}

document.querySelectorAll('[data-favorite]').forEach((button) => {
  const update = () => {
    const selected = favorites.includes(button.dataset.favorite);
    button.setAttribute('aria-pressed', String(selected));
    button.setAttribute('aria-label', `${selected ? '取消收藏' : '收藏'}${button.dataset.itemName}`);
  };
  update();
  button.addEventListener('click', () => {
    const id = button.dataset.favorite;
    favorites = favorites.includes(id) ? favorites.filter((item) => item !== id) : [...favorites, id];
    update();
    try {
      localStorage.setItem(favoriteKey, JSON.stringify(favorites));
    } catch (_) {
      // Keep the current session usable even when storage is blocked.
    }
  });
});
