const copyButton = document.getElementById('copy-email');
const copyStatus = document.getElementById('copy-status');
const email = 'tjy18726041937@163.com';
let resetTimer;

function fallbackCopy() {
  const field = document.createElement('textarea');
  field.value = email;
  field.setAttribute('readonly', '');
  field.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px;';
  document.body.appendChild(field);
  field.select();
  field.setSelectionRange(0, email.length);
  let copied = false;
  try { copied = document.execCommand('copy'); }
  finally { field.remove(); copyButton.focus({ preventScroll: true }); }
  return copied;
}

copyButton.addEventListener('click', async () => {
  if (copyButton.getAttribute('aria-busy') === 'true') return;
  clearTimeout(resetTimer);
  copyButton.setAttribute('aria-busy', 'true');
  copyButton.textContent = '复制中…';
  copyStatus.textContent = '';
  let copied = false;
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(email);
      copied = true;
    }
  } catch { /* Local files and denied clipboard permissions use the fallback. */ }
  if (!copied) {
    try { copied = fallbackCopy(); } catch { copied = false; }
  }
  copyButton.setAttribute('aria-busy', 'false');
  copyButton.textContent = copied ? '已复制 ✓' : '重试复制';
  copyStatus.dataset.state = copied ? 'success' : 'error';
  copyStatus.textContent = copied ? '邮箱已复制到剪贴板。' : '未能自动复制，请长按或选中上方邮箱手动复制。';
  if (copied) {
    resetTimer = setTimeout(() => {
      copyButton.textContent = '复制邮箱';
      copyStatus.textContent = '';
      delete copyStatus.dataset.state;
    }, 2500);
  }
});

// Product reviews use the same quick vertical reveal pattern as the reference site.
document.querySelectorAll('.review-toggle').forEach((toggle) => {
  const panel = document.getElementById(toggle.getAttribute('aria-controls'));
  if (!panel) return;
  toggle.addEventListener('click', () => {
    const open = toggle.getAttribute('aria-expanded') !== 'true';
    toggle.setAttribute('aria-expanded', String(open));
    panel.setAttribute('aria-hidden', String(!open));
  });
});

// Keep navigation state aligned with the section currently being read.
if ('IntersectionObserver' in window) {
  const navigationLinks = [...document.querySelectorAll('nav a')];
  const sectionObserver = new IntersectionObserver((entries) => {
    const active = entries.find((entry) => entry.isIntersecting);
    if (!active) return;
    navigationLinks.forEach((link) => {
      if (link.hash === `#${active.target.id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
  document.querySelectorAll('main > section[id], .hero').forEach((section) => sectionObserver.observe(section));
}

// Compact mobile navigation: click, keyboard, outside click and breakpoint reset.
const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.getElementById('main-nav');
const workDropdown = document.querySelector('.nav-dropdown');
const workDropdownTrigger = document.querySelector('.nav-dropdown-trigger');
function closeMenu(returnFocus = false) {
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', '展开导航');
  mainNav.classList.remove('is-open');
  if (returnFocus) menuToggle.focus();
}
menuToggle.addEventListener('click', () => {
  const open = menuToggle.getAttribute('aria-expanded') !== 'true';
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? '收起导航' : '展开导航');
  mainNav.classList.toggle('is-open', open);
});
mainNav.addEventListener('click', event => { if (event.target.closest('a')) closeMenu(); });
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && menuToggle.getAttribute('aria-expanded') === 'true') closeMenu(true);
});
document.addEventListener('click', event => {
  if (!event.target.closest('.header-inner')) closeMenu();
});
window.matchMedia('(max-width: 600px)').addEventListener('change', () => closeMenu());

workDropdownTrigger?.addEventListener('click', () => {
  const open = workDropdownTrigger.getAttribute('aria-expanded') !== 'true';
  workDropdownTrigger.setAttribute('aria-expanded', String(open));
  workDropdown?.classList.toggle('is-open', open);
});
workDropdown?.addEventListener('mouseleave', () => {
  workDropdownTrigger?.setAttribute('aria-expanded', 'false');
  workDropdown.classList.remove('is-open');
});

// Usage screenshots open in a focused modal so the platform numbers stay readable.
const proofDialog = document.getElementById('proof-dialog');
const proofDialogImage = proofDialog?.querySelector('img');
const proofDialogTitle = document.getElementById('proof-dialog-title');
let proofTrigger = null;

document.querySelectorAll('.mini-product-proof').forEach((proof) => {
  proof.addEventListener('click', () => {
    if (!proofDialog || !proofDialogImage) return;
    proofTrigger = proof;
    const focus = proof.dataset.proofFocus;
    const sourceImage = proof.querySelector('img');
    proofDialog.dataset.proofFocus = focus;
    proofDialogImage.alt = sourceImage?.alt || '小红书平台使用数据';
    proofDialogTitle.textContent = focus === 'li' ? '李清照的行李箱 · 平台使用数据' : '三金五金自由配 · 平台使用数据';
    proofDialog.showModal();
  });
});

proofDialog?.querySelector('.proof-dialog-close')?.addEventListener('click', () => proofDialog.close());
proofDialog?.addEventListener('click', (event) => {
  if (event.target === proofDialog) proofDialog.close();
});
proofDialog?.addEventListener('close', () => proofTrigger?.focus());
