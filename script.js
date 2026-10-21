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
      if (!favoriteStore) throw new Error('收藏存储不可用');
      favorites = favoriteStore.setFavorite(id, favorites.includes(id));
    } catch (_) {
      showToast('收藏仅在本次浏览中有效，请检查浏览器存储');
    }
  });
});
