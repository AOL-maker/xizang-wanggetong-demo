/* 客户看管 · 个人 · 客户异动：统计区改版为「看异动」6 卡（当月指标 / 昨日对比 / 预警三角）
   点击卡片按同一规则筛选下方名单，再次点击取消。 */
(function () {
  var STYLE_ID = 'ydStatStyle';
  var GRID_ID = 'ydStatGrid';

  var CSS = [
    '#ydStatHead{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;box-sizing:border-box}',
    '#ydStatHead .yd-left{display:flex;align-items:center;gap:8px}',
    '#ydStatHead .yd-bar{width:3px;height:15px;border-radius:2px;background:#2069e8;display:block}',
    '#ydStatHead .yd-title{font-size:16px;font-weight:800;color:#1f2733;letter-spacing:.2px}',
    '#ydStatHead .yd-links{display:flex;align-items:center;gap:10px;font-size:12.5px;color:#7b8491;white-space:nowrap}',
    '#ydStatHead .yd-links .lnk{color:#2069e8;cursor:pointer}',
    '#ydStatHead .yd-links .sep{color:#d8dee7}',
    '#' + GRID_ID + '{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;box-sizing:border-box;padding:2px 0 0}',
    '#' + GRID_ID + ' .yd-card{position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:6px;box-sizing:border-box;',
    '  min-height:72px;padding:10px 12px 9px;border-radius:8px;border:1px solid #e9ebf3;cursor:pointer;text-align:left;',
    '  background:linear-gradient(135deg,#ffffff 0%,#f1f2fa 100%);transition:border-color .16s,box-shadow .16s,background .16s}',
    '#' + GRID_ID + ' .yd-card:hover{border-color:#c9d8f6}',
    '#' + GRID_ID + ' .yd-card.on{border-color:#2f7cf6;background:linear-gradient(135deg,#f3f8ff 0%,#e6f0ff 100%);box-shadow:0 0 0 1px #2f7cf6 inset}',
    '#' + GRID_ID + ' .yd-top{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}',
    '#' + GRID_ID + ' .yd-name{font-size:13.5px;line-height:1.25;color:#333a45;white-space:nowrap}',
    '#' + GRID_ID + ' .yd-warn{flex:0 0 12px;width:12px;height:12px;display:block;margin-top:2px}',
    '#' + GRID_ID + ' .yd-bottom{display:flex;align-items:baseline;justify-content:space-between;gap:6px}',
    '#' + GRID_ID + ' .yd-num{font-size:19px;line-height:1.1;color:#20262f;font-weight:500;letter-spacing:.3px}',
    '#' + GRID_ID + ' .yd-yday{font-size:11.5px;color:#98a1ad;white-space:nowrap}',
    '#' + GRID_ID + ' .yd-yday b{color:#e8332a;font-weight:800;margin-left:3px}',
    '@media(max-width:420px){#' + GRID_ID + '{gap:8px}#' + GRID_ID + ' .yd-card{min-height:66px;padding:9px 10px 8px}#' + GRID_ID + ' .yd-name{font-size:12.5px}#' + GRID_ID + ' .yd-num{font-size:17px}}'
  ].join('\n');

  /* 图3：红色预警三角 */
  var WARN = '<svg class="yd-warn" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="ydWarnG" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#ff5a63"/><stop offset="1" stop-color="#ef2f38"/></linearGradient></defs>' +
    '<path d="M11.1 3.3a1 1 0 0 1 1.8 0l8.4 16.1a1 1 0 0 1-.9 1.5H3.6a1 1 0 0 1-.9-1.5L11.1 3.3Z" fill="url(#ydWarnG)"/>' +
    '</svg>';

  /* 指标 → 名单筛选用关键词（与下方名单同一规则） */
  var DATA = [
    { name: '当月携出客户数', cur: '800', yday: '600', key: '融合客户' },
    { name: '当月降档客户数', cur: '800', yday: '600', key: '宽带客户' },
    { name: '当月离网客户数', cur: '800', yday: '600', key: '待安排维系' },
    { name: '当月投诉客户数', cur: '800', yday: '600', key: '业务办理异常' },
    { name: '当月解约客户数', cur: '800', yday: '600', key: '服务事项未闭环' },
    { name: '流失预警客户数', cur: '800', yday: '600', key: '业务使用变化' }
  ];

  var active = -1;
  var originTitle = null;

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function isYidongActive() {
    var els = document.querySelectorAll('#root div, #root span');
    var found = false;
    for (var i = 0; i < els.length; i += 1) {
      var el = els[i];
      if ((el.textContent || '').trim() !== '客户异动') continue;
      found = true;
      var m = (getComputedStyle(el).color || '').match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (m) { var r = +m[1], b = +m[3]; if (b > r + 40 && b > 120) return true; }
    }
    return found ? false : true;
  }

  /* 取下方名单的客户卡片（最外层、单客户） */
  function collectItems() {
    var els = document.querySelectorAll('#root div');
    var out = [];
    for (var i = 0; i < els.length; i += 1) {
      var el = els[i];
      var t = el.textContent || '';
      if (t.indexOf('查看画像与关联事项') < 0) continue;
      if (t.length > 460) continue;
      if ((t.match(/看管人：/g) || []).length !== 1) continue;
      var p = el.parentElement;
      if (p) {
        var pt = p.textContent || '';
        if (pt.indexOf('查看画像与关联事项') >= 0 && (pt.match(/看管人：/g) || []).length === 1) continue;
      }
      out.push(el);
    }
    return out;
  }

  function applyFilter() {
    var items = collectItems();
    if (!items.length) return 0;
    var keep = active >= 0 ? DATA[active].key : null;
    var shown = 0;
    for (var i = 0; i < items.length; i += 1) {
      var match = !keep || (items[i].textContent || '').indexOf(keep) >= 0;
      items[i].style.display = match ? '' : 'none';
      if (match) shown += 1;
    }
    setListTitle(keep ? (DATA[active].name + ' · ' + shown + ' 位 · 本人责任范围') : null, shown);
    return shown;
  }

  function findListTitleEl() {
    var els = document.querySelectorAll('#root div');
    var best = null, bestLen = 1e9;
    for (var i = 0; i < els.length; i += 1) {
      var t = (els[i].textContent || '').trim();
      if (t.indexOf('本人责任范围') < 0 || t.indexOf('位') < 0 || t.length >= 40) continue;
      if (t.length < bestLen) { bestLen = t.length; best = els[i]; }
    }
    if (best && originTitle === null) originTitle = (best.textContent || '').trim();
    return best;
  }

  function setListTitle(text) {
    var el = findListTitleEl();
    if (!el) return;
    var next = text || originTitle;
    if (!next) return;
    if ((el.textContent || '').trim() !== next) {
      // 只改纯文本节点，避免破坏内部结构
      if (el.children.length === 0) el.textContent = next;
      else {
        var target = null;
        var walk = function (node) {
          for (var i = 0; i < node.children.length; i += 1) {
            var c = node.children[i];
            if (c.children.length === 0 && (c.textContent || '').indexOf('位') >= 0) { target = c; return; }
            walk(c);
            if (target) return;
          }
        };
        walk(el);
        if (target) target.textContent = next;
        else el.textContent = next;
      }
    }
  }

  function buildGrid() {
    var wrap = document.createElement('div');
    wrap.id = GRID_ID;
    DATA.forEach(function (d, i) {
      var c = document.createElement('div');
      c.className = 'yd-card';
      c.setAttribute('data-yd', String(i));
      c.innerHTML =
        '<div class="yd-top"><span class="yd-name">' + d.name + '</span>' + WARN + '</div>' +
        '<div class="yd-bottom"><span class="yd-num">' + d.cur + '</span>' +
        '<span class="yd-yday">昨日<b>' + d.yday + '</b></span></div>';
      c.addEventListener('click', function (ev) {
        ev.stopPropagation();
        active = (active === i) ? -1 : i;
        wrap.querySelectorAll('.yd-card').forEach(function (n, k) {
          n.classList.toggle('on', k === active);
        });
        applyFilter();
      });
      wrap.appendChild(c);
    });
    return wrap;
  }

  function buildHead() {
    var head = document.createElement('div');
    head.id = 'ydStatHead';
    head.innerHTML = '<div class="yd-left"><i class="yd-bar"></i><span class="yd-title">看异动</span></div>' +
      '<div class="yd-links"><span class="lnk" data-toast="查看指标说明">指标说明</span><span class="sep">|</span>' +
      '<span class="lnk" data-toast="查看更多异动指标">查看更多 ›</span></div>';
    head.addEventListener('click', function (e) {
      var el = e.target.closest('.lnk');
      if (el) { /* 轻提示 */ }
    });
    return head;
  }

  function restore() {
    var g = document.getElementById(GRID_ID);
    if (!g) { if (active >= 0) { active = -1; } return; }
    var host = g.parentElement;
    var hidden = host ? host.querySelectorAll('[data-yd-hidden="1"]') : [];
    for (var i = 0; i < hidden.length; i += 1) hidden[i].style.display = '';
    if (host) {
      var head = document.getElementById('ydStatHead');
      if (head && head.parentNode) head.parentNode.removeChild(head);
      var origHead = host.querySelector('[data-yd-orighead="1"]');
      if (origHead) { origHead.style.display = ''; origHead.removeAttribute('data-yd-orighead'); }
    }
    if (g.parentNode) g.parentNode.removeChild(g);
    // 还原列表
    collectItems().forEach(function (n) { n.style.display = ''; });
    setListTitle(null);
    originTitle = null;
    active = -1;
  }

  function directChildOf(el, ancestor) {
    var n = el;
    while (n && n.parentElement && n.parentElement !== ancestor) n = n.parentElement;
    return (n && n.parentElement === ancestor) ? n : null;
  }

  function apply() {
    injectStyle();
    if (!isYidongActive()) { restore(); return; }
    if (document.getElementById(GRID_ID)) { if (active >= 0) applyFilter(); return; }

    /* 1) 以标题文本为锚点，锁定统计卡容器 */
    var els = document.querySelectorAll('#root div');
    var titleEl = null, bestLen = 1e9;
    for (var i = 0; i < els.length; i += 1) {
      var tt = (els[i].textContent || '').trim();
      if (tt !== '客户异动统计数据') continue;
      if (tt.length < bestLen) { bestLen = tt.length; titleEl = els[i]; }
    }
    if (!titleEl || !titleEl.parentElement) return;
    var card = titleEl.parentElement;

    /* 2) 按钮行 / 提示行 = card 的直接子元素（向上回溯，避免误伤外层） */
    var btn = card.querySelector('button');
    if (!btn || (btn.textContent || '').indexOf('客户风险') < 0) {
      var btns = card.querySelectorAll('button');
      for (var b = 0; b < btns.length; b += 1) {
        if ((btns[b].textContent || '').indexOf('客户风险') >= 0) { btn = btns[b]; break; }
      }
    }
    if (!btn) return;
    var btnRow = directChildOf(btn, card);
    if (!btnRow) return;

    var tipEl = null;
    var inner = card.querySelectorAll('div');
    for (var k = 0; k < inner.length; k += 1) {
      var it = (inner[k].textContent || '').trim();
      if (it.indexOf('使用同一规则') >= 0 && it.length < 80) { tipEl = inner[k]; break; }
    }
    var tipRow = tipEl ? directChildOf(tipEl, card) : null;

    /* 3) 隐藏原标题行（含竖条），插入新标题与 6 卡 */
    var headRow = titleEl;
    while (headRow.parentElement && headRow.parentElement !== card && (headRow.parentElement.textContent || '').trim().length < 30) headRow = headRow.parentElement;
    headRow.setAttribute('data-yd-orighead', '1');
    headRow.style.display = 'none';

    card.insertBefore(buildHead(), card.firstChild);
    btnRow.setAttribute('data-yd-hidden', '1');
    btnRow.style.display = 'none';
    card.insertBefore(buildGrid(), btnRow);
    if (tipRow && tipRow !== btnRow) { tipRow.setAttribute('data-yd-hidden', '1'); tipRow.style.display = 'none'; }

    applyFilter();
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; apply(); }, 140);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  try { new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
  setInterval(apply, 900);
  window.__ydStatHook = 'v1';
})();
