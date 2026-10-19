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

const toast = document.querySelector('.toast');
let toastTimer;

document.querySelectorAll('[data-profile-action]').forEach((control) => {
  control.addEventListener('click', () => {
    clearTimeout(toastTimer);
    toast.textContent = `${control.dataset.profileAction}功能将在下一版本开放`;
    toast.classList.add('visible');
    toastTimer = setTimeout(() => toast.classList.remove('visible'), 2200);
  });
});
