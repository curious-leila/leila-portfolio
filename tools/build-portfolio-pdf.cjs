/**
 * Leila 作品集 PDF 一键生成（竖版 A4 比例，每页内容饱满）
 *
 * 用法（先确保本地预览服务在跑：python -m http.server 8124 --bind 127.0.0.1）：
 *   node tools/build-portfolio-pdf.cjs
 *   node tools/build-portfolio-pdf.cjs https://curious-leila.github.io/leila-portfolio/ 自定义输出.pdf
 *
 * 页面结构：
 *   p1 首屏 + 关于我              p2 项目 01      p3 项目 01 截图（3 张）
 *   p4 项目 02                    p5 项目 02 截图（3 张）
 *   p6 项目 03                    p7 项目 03 截图（2 张）
 *   p8 轻量产品实践 + 能力图谱     p9 联系我 + 数据说明页
 *
 * 特性：全展开、超链接保留、每页模块完整不截断、页内内容自动缩放填满、
 *       图片全部走打印专用压缩版，整本通常 2 MB 以内。
 */
const PW_PATH = process.env.PW_PATH || 'C:/Users/HUAWEI/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright';
const { chromium } = require(PW_PATH);
const fs = require('fs');
const path = require('path');

const URL = process.argv[2] || 'http://127.0.0.1:8124/';
const ROOT = path.resolve(__dirname, '..', '..');
const OUT = process.argv[3] || path.join(ROOT, 'output', 'pdf', 'Leila_AI_Product_Portfolio_CN.pdf');
const ASSETS = path.join(ROOT, 'tmp', 'pdfs', 'print-assets');
const SHOTS = path.join(ASSETS, 'shots');
const QR_PATH = path.join(ROOT, 'tmp', 'pdfs', 'qr-portfolio.png');
const SITE_URL = 'https://curious-leila.github.io/leila-portfolio/';
const EMAIL = 'tjy18726041937@163.com';

const PAGE_W = 1100;   // 竖版页宽（与参考作品集同比例）
const PAGE_H = 1555;   // A4 竖版比例：1100 × 1.414
const PAD = 44;        // 页内安全边距
const EDGE = 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe';

// 每个项目后面的截图页（按编号顺序）
const SHOT_GROUPS = [
  { project: 1, files: ['项目一1.jpg', '项目一2.jpg', '项目一3.jpg'] },
  { project: 2, files: ['项目二1.jpg', '项目二2.jpg', '项目二3.jpg'] },
  { project: 3, files: ['项目三1.jpg', '项目三2.jpg'] },
];

const dataUri = (file, mime) => `data:${mime};base64,` + fs.readFileSync(file).toString('base64');
const kb = (n) => (n / 1024).toFixed(0) + ' KB';
const mb = (n) => (n / 1048576).toFixed(2) + ' MB';

(async () => {
  const qrUri = dataUri(QR_PATH, 'image/png');
  const heroUri = dataUri(path.join(ASSETS, 'hero.jpg'), 'image/jpeg');
  const coverUris = [dataUri(path.join(ASSETS, 'cover-li.jpg'), 'image/jpeg'), dataUri(path.join(ASSETS, 'cover-gold.jpg'), 'image/jpeg')];
  const usageUris = { li: dataUri(path.join(ASSETS, 'usage-li.png'), 'image/png'), gold: dataUri(path.join(ASSETS, 'usage-gold.png'), 'image/png') };
  const shotGroups = SHOT_GROUPS.map((g) => ({ project: g.project, uris: g.files.map((f) => dataUri(path.join(SHOTS, f), 'image/jpeg')) }));
  const today = new Date();
  const dateStr = `${today.getFullYear()}.${String(today.getMonth() + 1).padStart(2, '0')}.${String(today.getDate()).padStart(2, '0')}`;

  const browser = await chromium.launch({ headless: true, executablePath: EDGE });
  const page = await browser.newPage({ viewport: { width: PAGE_W, height: 1600 }, deviceScaleFactor: 1 });
  await page.goto(URL, { waitUntil: 'load', timeout: 60000 });
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.evaluate(() => {
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; });
    window.scrollTo(0, document.body.scrollHeight);
  });
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.emulateMedia({ media: 'print' });

  await page.addStyleTag({
    content: `
      @page { margin: 0; }
      * { animation: none !important; transition: none !important; }
      html, body { background: #fdfbf6 !important; }
      .site-header { position: static !important; }
      .hero:before { background-image: url(${heroUri}) !important; background-position: 60% center !important; }
      .menu-toggle, .nav-submenu, .skip-link, .proof-dialog, footer { display: none !important; }
      /* 隐藏滚动提示文字，但保留站位，让首屏的蓝色背景自然覆盖那一行 */
      .scroll-link { visibility: hidden !important; }
      /* 折叠的产品决策与复盘全部展开 */
      .review-toggle { pointer-events: none !important; }
      .review-toggle .when-closed, .review-toggle .disclosure-symbol { display: none !important; }
      .review-toggle .when-open { display: inline !important; }
      .retrospective-expand { grid-template-rows: 1fr !important; }
      .retrospective-expand-inner { overflow: visible !important; }
      /* 竖版下的紧凑排布 */
      .hero { min-height: 0 !important; padding: 26px 0 22px !important; gap: 26px !important; }
      .section { padding-top: 20px !important; padding-bottom: 18px !important; }
      .section-heading { margin-bottom: 14px !important; }
      .section-heading h2 { font-size: 30px !important; }
      .projects-group { padding: 20px 22px 20px 36px !important; }
      .project-description { font-size: 15.5px !important; }
      /* 分页保护：任何模块都不跨页 */
      .hero, .about-surface, .education-grid, .direction, .project, .project-header,
      .mini-product-card, .mini-products-intro, .skills-grid, .skills-grid > div, .contact,
      .retrospective-card, .case-background, .project-body li, .work-list li,
      .profile-card, .section-heading, .mini-product-proof, .print-note { break-inside: avoid !important; }
      .section-heading, .project-header { break-after: avoid !important; }
      /* 轻量产品卡片：并排两列，与能力图谱卡片等宽，字号相应减小 */
      .mini-products-grid { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
      .mini-product-card, .mini-product-card.featured, .mini-product-card.secondary {
        grid-template-columns: 1fr !important; gap: 12px !important; padding: 18px !important;
        align-items: start !important; box-shadow: 0 8px 22px #4a332014 !important;
      }
      .mini-product-cover { width: 100% !important; height: auto !important; max-height: 300px; object-fit: contain; background: #fff; }
      .mini-product-card h3 { font-size: 20.5px !important; margin: 6px 0 8px !important; line-height: 1.42 !important; }
      .mini-product-card p { font-size: 14px !important; line-height: 1.78 !important; }
      .mini-product-meta, .mini-product-meta-right, .mini-product-badge { font-size: 11px !important; }
      .mini-product-link { width: 100% !important; min-height: 38px !important; font-size: 13px !important; }
      .mini-product-proof-caption { font-size: 13px !important; }
      .mini-products-intro { font-size: 15px !important; margin-bottom: 12px !important; }
      .skills-grid h3 { font-size: 17px !important; }
      .skills-grid .skill-list li, .skill-list li { font-size: 13.5px !important; line-height: 1.68 !important; }
      /* 项目截图页：每页正好排满一个项目的截图 */
      .pdf-shot-page {
        break-before: page !important;
        height: ${PAGE_H - 2 * PAD - 40}px;
        display: flex; flex-direction: column; justify-content: space-evenly;
        align-items: center; gap: 16px; box-sizing: border-box;
      }
      .pdf-shot-page img {
        display: block; width: 100%; height: auto;
        border: 1.5px solid #9fc9dc; border-radius: 12px; background: #fff;
      }
      /* 末页说明（与联系我同一页，做成一张卡片） */
      .print-note {
        margin-top: 22px; padding: 20px 24px; border: 1.5px solid #9fc9dc; border-radius: 16px;
        background: #f7fbfd; display: flex; align-items: center; gap: 26px; justify-content: space-between;
        font-family: "PingFang SC", "HarmonyOS Sans SC", "OPPO Sans", "Microsoft YaHei", sans-serif;
      }
      .print-note h2 { font-size: 19px !important; margin: 0 0 8px !important; padding: 0 !important; border: 0 !important; background: none !important; box-shadow: none !important; }
      .print-note p { font-size: 14px !important; line-height: 1.8 !important; color: #44585c; }
      .print-note a { color: #2f6577; text-decoration: underline; text-underline-offset: 3px; }
      .print-note .pn-qr { width: 132px; height: 132px; border: 1.5px solid #9fc9dc; border-radius: 12px; padding: 8px; background: #fff; flex: none; }
      .print-note .pn-date { font-weight: 700; color: #24464d; }
    `,
  });

  await page.evaluate(async ({ qrUri, SITE_URL, EMAIL, dateStr, coverUris, usageUris, shotGroups, PAGE_W, PAGE_H, PAD }) => {
    await document.fonts.ready;
    const set = (sel, fn) => document.querySelectorAll(sel).forEach(fn);

    // 打印专用压缩图
    set('.mini-product-cover', (img, i) => { if (coverUris[i]) img.src = coverUris[i]; });
    set('.mini-product-proof', (btn) => {
      const img = btn.querySelector('img');
      if (img) img.src = usageUris[btn.dataset.proofFocus === 'gold' ? 'gold' : 'li'];
    });
    // 展开复盘
    set('.review-toggle', (t) => {
      t.setAttribute('aria-expanded', 'true');
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (panel) panel.setAttribute('aria-hidden', 'false');
      const open = t.querySelector('.when-open');
      if (open) open.textContent = '产品决策与复盘';
    });
    set('img[loading="lazy"]', (img) => { img.loading = 'eager'; });

    // 每个项目后面插入截图页
    const projects = [...document.querySelectorAll('#projects .project')];
    shotGroups.forEach(({ project, uris }) => {
      const proj = projects[project - 1];
      if (!proj) return;
      const sec = document.createElement('div');
      sec.className = 'pdf-shot-page';
      sec.id = 'shot-page-' + project;
      sec.innerHTML = uris.map((u, k) => `<img src="${u}" alt="项目 ${project} 界面截图 ${k + 1}">`).join('');
      proj.insertAdjacentElement('afterend', sec);
    });

    // 联系我下面追加数据说明卡片（末页说明并入最后一页）
    const contactSection = document.querySelector('#contact');
    if (contactSection && !contactSection.querySelector('.print-note')) {
      const note = document.createElement('div');
      note.className = 'print-note';
      note.innerHTML = `
        <div>
          <h2>关于这份作品集</h2>
          <p>本 PDF 为 <span class="pn-date">${dateStr}</span> 版页面快照，所载平台数据均为该日期前的记录；
             两个小红书小工具的使用人数仍在持续增长，最新数据与在线 Demo 见右侧二维码或
             <a href="${SITE_URL}">${SITE_URL.replace('https://', '')}</a></p>
          <p>联系方式:&nbsp;<a href="mailto:${EMAIL}">${EMAIL}</a></p>
        </div>
        <img class="pn-qr" src="${qrUri}" alt="作品集网站二维码">`;
      contactSection.appendChild(note);
    }

    // 显式分页：一个项目一页，截图页紧随其后
    const breakBefore = (el) => { if (el) el.style.breakBefore = 'page'; };
    breakBefore(document.querySelector('#projects > .section-heading'));
    breakBefore(projects[1]);
    breakBefore(projects[2]);
    breakBefore(document.querySelector('#mini-products > .section-heading'));
    breakBefore(document.querySelector('#skills > .section-heading'));
  }, { qrUri, SITE_URL, EMAIL, dateStr, coverUris, usageUris, shotGroups, PAGE_W, PAGE_H, PAD });

  await page.evaluate(() => Promise.all([...document.querySelectorAll('img')].map((i) => i.decode().catch(() => {}))));

  // ---- 页内适配：内容超出可用高度时整页等比缩小；截图页不足时均匀分布 ----
  const fit = await page.evaluate(({ PAGE_H, PAD }) => {
    const q = (s) => [...document.querySelectorAll(s)];
    const projects = q('#projects .project');
    const pages = [
      { id: 'p1 首屏+关于我', els: ['.hero', '#about'].flatMap((s) => q(s)) },
      { id: 'p2 项目01', els: [q('#projects > .section-heading')[0], projects[0]].filter(Boolean) },
      { id: 'p3 项目01截图', els: [q('#shot-page-1')].flat() },
      { id: 'p4 项目02', els: [projects[1]].filter(Boolean) },
      { id: 'p5 项目02截图', els: [q('#shot-page-2')].flat() },
      { id: 'p6 项目03', els: [projects[2]].filter(Boolean) },
      { id: 'p7 项目03截图', els: [q('#shot-page-3')].flat() },
      { id: 'p8 轻量产品实践', els: [q('#mini-products > .section-heading')[0], q('.mini-products-intro')[0], q('.mini-products-grid')[0]].filter(Boolean) },
      { id: 'p9 能力图谱+联系我', els: [q('#skills > .section-heading')[0], q('.skills-grid')[0], q('#contact > .section-heading')[0], q('#contact .contact')[0], q('.print-note')[0]].filter(Boolean) },
    ];
    const available = PAGE_H - 2 * PAD;
    const report = [];
    for (const pg of pages) {
      if (!pg.els.length) continue;
      const tops = pg.els.map((e) => e.getBoundingClientRect().top + window.scrollY);
      const bots = pg.els.map((e) => e.getBoundingClientRect().bottom + window.scrollY);
      const h = Math.round(Math.max(...bots) - Math.min(...tops));
      let zoom = 1;
      if (h > available) zoom = Math.max(0.6, +(available / h).toFixed(3));
      if (zoom !== 1) pg.els.forEach((e) => { e.style.zoom = zoom; });
      const extra = available - h * zoom;
      if (extra > 110 && pg.els.length > 1) {
        const add = (extra * 0.9) / (pg.els.length - 1);
        pg.els.slice(1).forEach((e) => {
          const cur = parseFloat(getComputedStyle(e).marginTop) || 0;
          e.style.marginTop = Math.round(cur + add) + 'px';
        });
      }
      report.push({ page: pg.id, contentH: h, zoom, spread: extra > 110 && pg.els.length > 1 ? Math.round((extra * 0.9) / (pg.els.length - 1)) : 0, fits: h * zoom <= available + 4 });
    }
    return report;
  }, { PAGE_H, PAD });

  const pdfBuffer = await page.pdf({
    width: `${PAGE_W}px`,
    height: `${PAGE_H}px`,
    printBackground: true,
    margin: { top: '0', right: '0', bottom: '0', left: '0' },
  });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, pdfBuffer);
  await browser.close();

  console.log('PDF written:', OUT);
  console.log(`  size: ${pdfBuffer.length > 1048576 ? mb(pdfBuffer.length) : kb(pdfBuffer.length)}  |  page ${PAGE_W}x${PAGE_H}px  |  ${dateStr}`);
  fit.forEach((f) => console.log(`  ${f.page.padEnd(22)} content ${String(f.contentH).padStart(5)}px  zoom ${f.zoom}  ${f.fits ? 'ok' : 'OVERFLOW'}`));
})().catch((e) => { console.error('FAILED:', e); process.exit(1); });
