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
