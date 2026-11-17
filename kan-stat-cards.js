/* 客户看管 · 个人 · 总览：「看结果」统计区改版
   仅替换「客户规模/宽带客户规模/离网客户规模」数字行与三环图，其余保持原样。 */
(function () {
  var STYLE_ID = 'krStatStyle';
  var GRID_ID = 'krStatGrid';

  var CSS = [
    '#' + GRID_ID + '{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;box-sizing:border-box;padding:2px 0}',
    '#' + GRID_ID + ' .kr-card{display:flex;align-items:center;justify-content:space-between;gap:8px;box-sizing:border-box;',
    '  min-height:68px;padding:11px 12px 11px 14px;border-radius:9px;',
    '  background:linear-gradient(135deg,#f8fbff 0%,#e4effe 100%);border:1px solid #e8f1fc}',
    '#' + GRID_ID + ' .kr-txt{min-width:0}',
    '#' + GRID_ID + ' .kr-t{font-size:13px;line-height:1.25;color:#3d4753;white-space:nowrap;letter-spacing:.1px}',
    '#' + GRID_ID + ' .kr-v{font-size:18px;line-height:1.25;color:#1b2430;font-weight:500;margin-top:2px;letter-spacing:.2px}',
    '#' + GRID_ID + ' .kr-ico{flex:0 0 30px;width:30px;height:30px;display:block}',
    '@media(max-width:420px){#' + GRID_ID + '{gap:8px}#' + GRID_ID + ' .kr-card{padding:9px 10px;min-height:60px}#' + GRID_ID + ' .kr-t{font-size:12px}#' + GRID_ID + ' .kr-v{font-size:16px}#' + GRID_ID + ' .kr-ico{flex-basis:28px;width:28px;height:28px}}'
  ].join('\n');

  /* 五边形 + 人像 + 右下浅蓝手形（个人类客户） */
  function penta(uid) {
    return '<svg class="kr-ico" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M20 2.4 37 13.6 30.5 35.4H9.5L3 13.6 20 2.4Z" fill="#1f7bf3"/>' +
      '<circle cx="20" cy="15.6" r="4.7" fill="#b6d8ff"/>' +
      '<path d="M13.4 28.4c0-3.5 2.9-6.1 6.6-6.1 3.7 0 6.6 2.6 6.6 6.1H13.4Z" fill="#b6d8ff"/>' +
      '<circle cx="29.4" cy="27.6" r="7.1" fill="#9fcbff" fill-opacity=".82"/>' +
      '<path d="M29.4 24.1c1 0 1.7.8 1.7 1.8v.6h.6c1 0 1.8.7 1.8 1.7s-.8 1.7-1.8 1.7h-.6v.6c0 1-.7 1.8-1.7 1.8s-1.8-.8-1.8-1.8v-.6h-.6c-1 0-1.7-.7-1.7-1.7s.7-1.7 1.7-1.7h.6v-.6c0-1 .8-1.8 1.8-1.8Z" fill="#ffffff" fill-opacity=".95"/>' +
      '</svg>';
  }

  /* 圆形 + 人像 + 右下齿轮（集团/其他类客户） */
  function round(uid) {
    var teeth = '';
    for (var i = 0; i < 8; i += 1) {
      teeth += '<rect x="29.2" y="20.4" width="2.4" height="3.4" rx="1" fill="#ffffff" transform="rotate(' + (i * 45) + ' 30.4 27.8)"/>';
    }
    return '<svg class="kr-ico" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<circle cx="20" cy="20" r="17.2" fill="#2b7cf6"/>' +
      '<circle cx="20" cy="15.6" r="4.7" fill="#c3ddff"/>' +
      '<path d="M13.4 28.4c0-3.5 2.9-6.1 6.6-6.1 3.7 0 6.6 2.6 6.6 6.1H13.4Z" fill="#c3ddff"/>' +
      '<circle cx="30.4" cy="27.8" r="6.4" fill="#1560d8"/>' +
      teeth +
      '<circle cx="30.4" cy="27.8" r="2.5" fill="#ffffff"/>' +
      '<circle cx="30.4" cy="27.8" r="1.1" fill="#1560d8"/>' +
      '</svg>';
  }

  var DATA = [
    ['个人全量客户', '2378', 'p'],
    ['集团AB成员客户', '2378', 'r'],
    ['新入网(T-6)客户', '1,600', 'p'],
    ['中高档客户', '2378', 'r'],
    ['宽带客户', '1,600', 'p'],
    ['携转挽留中客户', '1,600', 'r']
  ];

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function buildGrid() {
    var wrap = document.createElement('div');
    wrap.id = GRID_ID;
    for (var i = 0; i < DATA.length; i += 1) {
      var c = document.createElement('div');
      c.className = 'kr-card';
      c.innerHTML = '<div class="kr-txt"><div class="kr-t">' + DATA[i][0] + '</div><div class="kr-v">' + DATA[i][1] + '</div></div>' +
        (DATA[i][2] === 'p' ? penta(i) : round(i));
      wrap.appendChild(c);
    }
    return wrap;
  }

  /* 仅「总览」页生效：总览 tab 选中时文字为蓝色 */
  function isOverviewActive() {
    var els = document.querySelectorAll('#root div, #root span');
    var found = false;
    for (var i = 0; i < els.length; i += 1) {
      var el = els[i];
      if ((el.textContent || '').trim() !== '总览') continue;
      found = true;
      var m = (getComputedStyle(el).color || '').match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (m) {
        var r = +m[1], b = +m[3];
        if (b > r + 40 && b > 120) return true;
      }
    }
    return found ? false : true;
  }

  /* 离开「总览」时还原原生内容，避免影响其他标签页 */
  function restore() {
    var g = document.getElementById(GRID_ID);
    if (!g) return;
    var row = g.nextElementSibling;
    var ring = row && row.nextElementSibling;
    if (row) { row.style.display = ''; row.__krDone = 0; }
    if (ring && (ring.textContent || '').indexOf('保有率') >= 0) ring.style.display = '';
    if (g.parentNode) g.parentNode.removeChild(g);
  }

  function apply() {
    injectStyle();
    if (!isOverviewActive()) { restore(); return; }
    var grid = document.getElementById(GRID_ID);
    if (grid) {
      // 已注入：仅兜底修复原行/环图（React 重设 style 时），不做全量扫描
      var row = grid.nextElementSibling;
      if (row && (row.textContent || '').indexOf('离网客户规模') >= 0 && getComputedStyle(row).display !== 'none') row.style.display = 'none';
      var ring = row && row.nextElementSibling;
      if (ring && (ring.textContent || '').indexOf('保有率') >= 0 && getComputedStyle(ring).display !== 'none') ring.style.display = 'none';
      return;
    }
    var root = document.getElementById('root');
    if (!root) return;
    var nodes = root.querySelectorAll('div');
    for (var i = 0; i < nodes.length; i += 1) {
      var el = nodes[i];
      var t = el.textContent || '';
      if (t.length > 60) continue;
      if (t.slice(0, 4) !== '客户规模') continue;          // 仅命中「三列数字」这一行，避免误伤外层卡片
      if (t.indexOf('宽带客户规模') < 0 || t.indexOf('离网客户规模') < 0) continue;
      var card = el.parentElement;
      if (!card || el.__krDone) continue;
      if ((card.textContent || '').indexOf('看结果') < 0) continue; // 必须落在「看结果」卡片内
      el.__krDone = 1;
      // 隐藏原「三列数字」与「三环图」，保留「看结果」标题行与「稳定度得分」行
      el.style.display = 'none';
      var ring = el.nextElementSibling;
      if (ring && (ring.textContent || '').indexOf('保有率') >= 0) ring.style.display = 'none';
      card.insertBefore(buildGrid(), el);
      return;
    }
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; apply(); }, 120);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { apply(); });
  else apply();

  try {
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(apply, 900);
  window.__krStatHook = 'v1';
})();
