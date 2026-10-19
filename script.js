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
