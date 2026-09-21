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

// 平台使用数据：卡片里的截图点击后打开完整原图，便于 HR 放大核对具体数字。
const proofLightbox = document.getElementById('proof-lightbox');
const proofLightboxImage = document.getElementById('proof-lightbox-image');
const proofLightboxTitle = document.getElementById('proof-lightbox-title');
let proofTrigger = null;

document.querySelectorAll('.platform-data-stack .clickable-proof').forEach((proof) => {
  proof.addEventListener('click', () => {
    const source = proof.querySelector('img');
    if (!proofLightbox || !proofLightboxImage || !source) return;
    proofTrigger = proof;
    const alt = source.getAttribute('alt') || '平台使用数据';
    proofLightboxImage.removeAttribute('srcset');
    // 高清素材：2x 屏下把大图换成 2x 资源，并按逻辑尺寸锁死宽度
    // （既不放大也不缩小，只是让设备像素与原图 1:1，纯提清晰度）
    const base = source.getAttribute('src');
    const hiRes = base.replace(/\.png$/i, '-2x.png');
    proofLightboxImage.src = (window.devicePixelRatio || 1) > 1 ? hiRes : base;
    proofLightboxImage.style.width = source.naturalWidth ? source.naturalWidth + 'px' : '';
    proofLightboxImage.alt = alt;
    if (proofLightboxTitle) {
      proofLightboxTitle.textContent = alt.split('，')[0].replace(/使用数据$/, '') + ' · 平台使用数据';
    }
    proofLightbox.showModal();
  });
});

proofLightbox?.querySelector('.proof-lightbox-close')?.addEventListener('click', () => proofLightbox.close());
proofLightbox?.addEventListener('click', (event) => {
  if (event.target === proofLightbox) proofLightbox.close();
});
proofLightbox?.addEventListener('close', () => proofTrigger?.focus());

/* 微信「手机端」内置浏览器（iOS WKWebView / 安卓 X5）不支持 <a download> 触发的文件下载：
   点击后不发起真实请求，只会落下一个 0KB 的空文件，并被微信按下载文件名缓存成
   「坏记录」（之后换了文件也不重新请求）。而微信内置查看器本身能正常渲染 PDF，
   所以这里不做任何弹层，只做两件事：
     ① 摘掉 download 属性 —— 按钮变成普通链接，点击直接在微信里「预览」PDF，
        预览页可用「··· / 用其他应用打开」保存到文件；
     ② 文案由「下载简历 PDF」改成「预览简历」，避免用户以为点了没反应。
   生效范围仅限「手机微信」：桌面浏览器、微信电脑版（WindowsWechat / MacWechat）
   以及手机自带浏览器一律不受影响，仍照常下载、保留中文文件名。 */
const ua = navigator.userAgent;
const isMobileWeChat = /MicroMessenger/i.test(ua) && /Android|iPhone|iPad|iPod/i.test(ua);
if (isMobileWeChat) {
  document.querySelectorAll('a.js-resume').forEach((link) => {
    link.removeAttribute('download');
    link.textContent = '预览简历';
  });
}
