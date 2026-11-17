/* 客户看管 · 总览：统计区 6 卡化（两列三行）
   - 个人 · 总览：「看结果」卡片内 客户规模/宽带客户规模/离网客户规模 + 三环图 → 6 卡
   - 小区 · 总览：在管小区/关联客户/异动关注 + 三环图 + 脚注 → 6 卡
   - 园楼 · 总览：在管园楼/关联客户/异动关注 + 三环图 + 脚注 → 6 卡
   其余区域（标题行、稳定度得分、快捷查询、列表）保持原样。 */
(function () {
  var STYLE_ID = 'krStatStyle';
  var GRID_ID = 'krStatGrid';

  var CSS = [
    '#' + GRID_ID + '{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;box-sizing:border-box;padding:2px 0}',
    '#' + GRID_ID + ' .kr-card{display:flex;align-items:center;justify-content:space-between;gap:8px;box-sizing:border-box;',
    '  min-height:70px;padding:11px 12px 11px 14px;border-radius:10px;',
    '  background:linear-gradient(135deg,#f9fcff 0%,#e3eefe 100%);border:1px solid #e8f1fc}',
    '#' + GRID_ID + ' .kr-txt{min-width:0}',
    '#' + GRID_ID + ' .kr-t{font-size:13.5px;line-height:1.25;color:#48525f;white-space:nowrap;letter-spacing:.1px}',
    '#' + GRID_ID + ' .kr-v{font-size:19px;line-height:1.25;color:#1b2430;font-weight:600;margin-top:3px;letter-spacing:.2px}',
    '#' + GRID_ID + ' .kr-ico{flex:0 0 34px;width:34px;height:34px;display:block}',
    '@media(max-width:420px){#' + GRID_ID + '{gap:8px}#' + GRID_ID + ' .kr-card{padding:9px 10px;min-height:62px}',
    '#' + GRID_ID + ' .kr-t{font-size:12px}#' + GRID_ID + ' .kr-v{font-size:16px}',
    '#' + GRID_ID + ' .kr-ico{flex-basis:30px;width:30px;height:30px}}'
  ].join('\n');

  /* 五边形 + 人像 + 右下浅蓝手形 */
  function penta() {
    return '<svg class="kr-ico" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M20 2.4 37 13.6 30.5 35.4H9.5L3 13.6 20 2.4Z" fill="#1f7bf3"/>' +
      '<circle cx="20" cy="15.6" r="4.7" fill="#b6d8ff"/>' +
      '<path d="M13.4 28.4c0-3.5 2.9-6.1 6.6-6.1 3.7 0 6.6 2.6 6.6 6.1H13.4Z" fill="#b6d8ff"/>' +
      '<circle cx="29.4" cy="27.6" r="7.1" fill="#9fcbff" fill-opacity=".82"/>' +
      '<path d="M29.4 24.1c1 0 1.7.8 1.7 1.8v.6h.6c1 0 1.8.7 1.8 1.7s-.8 1.7-1.8 1.7h-.6v.6c0 1-.7 1.8-1.7 1.8s-1.8-.8-1.8-1.8v-.6h-.6c-1 0-1.7-.7-1.7-1.7s.7-1.7 1.7-1.7h.6v-.6c0-1 .8-1.8 1.8-1.8Z" fill="#ffffff" fill-opacity=".95"/>' +
      '</svg>';
  }

  /* 圆形 + 人像 + 右下齿轮 */
  function round() {
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

  /* 每个页签的配置：如何识别原生统计行、要隐藏哪些行、换成哪 6 张卡 */
  var TABS = [
    {
      key: 'per',
      start: '客户规模',
      must: ['宽带客户规模', '离网客户规模'],
      cardMark: '看结果',
      hideFoot: false,
      data: [
        ['个人全量客户', '2378', 'p'],
        ['集团AB成员客户', '2378', 'r'],
        ['新入网(T-6)客户', '1,600', 'p'],
        ['中高档客户', '2378', 'r'],
        ['宽带客户', '1,600', 'p'],
        ['携转挽留中客户', '1,600', 'r']
      ]
    },
    {
      key: 'xq',
      start: '在管小区',
      must: ['关联客户', '异动关注'],
      cardMark: '小区健康率',
      hideFoot: true,
      data: [
        ['小区(农村)数量', '2378', 'p'],
        ['移动客户规模', '2378', 'r'],
        ['宽带客户规模', '1,600', 'p'],
        ['全球通客户规模', '2378', 'r'],
        ['千兆小区数量', '1,600', 'p'],
        ['合约客户规模', '1,600', 'r']
      ]
    },
    {
      key: 'yl',
      start: '在管园楼',
      must: ['关联客户', '异动关注'],
      cardMark: '园楼健康率',
      hideFoot: true,
      data: [
        ['楼宇(园区)数量', '2378', 'p'],
        ['楼宇(园区)企业数', '2378', 'r'],
        ['建档集团数', '1,600', 'p'],
        ['企业渗透数', '2378', 'r'],
        ['企业渗透率', '91.23%', 'p'],
        ['企业成员数', '1,600', 'r']
      ]
    }
  ];

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function buildGrid(cfg) {
    var wrap = document.createElement('div');
    wrap.id = GRID_ID;
    wrap.setAttribute('data-kr', cfg.key);
    for (var i = 0; i < cfg.data.length; i += 1) {
      var c = document.createElement('div');
      c.className = 'kr-card';
      c.innerHTML = '<div class="kr-txt"><div class="kr-t">' + cfg.data[i][0] + '</div>' +
        '<div class="kr-v">' + cfg.data[i][1] + '</div></div>' +
        (cfg.data[i][2] === 'p' ? penta() : round());
      wrap.appendChild(c);
    }
    return wrap;
  }

  /* 当前一级页签（个人/小区/园楼/集团/家庭）→ 对应配置 key
     注意：RN 会把其它页签的页面留在 DOM 里（隐藏），必须靠高亮色判断当前页，
     否则切换页签后会把上一页的 grid 当成当前页的而不再重建。 */
  var TYPE_KEY = { '个人': 'per', '小区': 'xq', '园楼': 'yl' };
  var TOP_NAMES = ['个人', '小区', '园楼', '集团', '家庭'];

  function activeTopType() {
    var btns = document.querySelectorAll('#root button');
    var found = undefined, foundW = -1;
    for (var i = 0; i < btns.length; i += 1) {
      var t = (btns[i].textContent || '').trim();
      if (TOP_NAMES.indexOf(t) < 0) continue;
      if (!btns[i].getClientRects().length) continue;
      var inner = btns[i].querySelector('div') || btns[i];
      var m = (getComputedStyle(inner).color || '').match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (!m || !(+m[3] > +m[1] + 40 && +m[3] > 120)) continue;
      var w = btns[i].parentNode ? btns[i].parentNode.getBoundingClientRect().width : 0;
      if (w > foundW) { found = t; foundW = w; }
    }
    return found;   /* undefined = 识别不到（过渡态），null 不会出现 */
  }

  /* 仅「总览」生效：总览 tab 选中时文字为蓝色 */
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

  function isRingRow(n) {
    if (!n) return false;
    var t = n.textContent || '';
    if (t.length > 60) return false;
    return t.indexOf('保有率') >= 0 || t.indexOf('健康率') >= 0 || t.indexOf('覆盖率') >= 0;
  }

  function isFootRow(n) {
    if (!n) return false;
    var t = (n.textContent || '').trim();
    return t.indexOf('统计仅包含') === 0 && t.length < 100;
  }

  /* 离开「总览」/ 换页签时还原原生内容 */
  function restore() {
    var g = document.getElementById(GRID_ID);
    if (!g) return;
    var hidden = g.__krHidden || [];
    for (var i = 0; i < hidden.length; i += 1) {
      if (!hidden[i]) continue;
      if (hidden[i].style) hidden[i].style.display = '';
      hidden[i].__krDone = 0;   /* 允许切回「总览」时重新注入 */
    }
    g.__krHidden = [];
    if (g.parentNode) g.parentNode.removeChild(g);
  }

  function hideNode(n, store) {
    if (!n) return;
    store.push(n);
    n.style.display = 'none';
  }

  function apply() {
    injectStyle();
    if (!isOverviewActive()) { restore(); return; }

    var type = activeTopType();
    var want;                                  /* undefined = 判断不出当前页，沿用现状 */
    if (type) want = TYPE_KEY.hasOwnProperty(type) ? TYPE_KEY[type] : null;

    var grid = document.getElementById(GRID_ID);
    if (grid) {
      var gridKey = grid.getAttribute('data-kr');
      /* 当前页与已注入的配置不一致（切了页签）→ 先还原，再按新页签重建 */
      if (want !== undefined && want !== gridKey) {
        restore();
      } else {
        /* 已注入：兜底修复（React 重设 display） */
        var cfg0 = null;
        for (var c0 = 0; c0 < TABS.length; c0 += 1) if (TABS[c0].key === gridKey) cfg0 = TABS[c0];
        if (!cfg0 || !grid.parentNode) { restore(); return; }
        var hidden0 = grid.__krHidden || [];
        for (var h = 0; h < hidden0.length; h += 1) {
          if (hidden0[h] && hidden0[h].parentNode && hidden0[h].style.display !== 'none') hidden0[h].style.display = 'none';
        }
        return;
      }
    }
    if (want === null) return;                 /* 该页签暂无配置（集团/家庭）*/

    var root = document.getElementById('root');
    if (!root) return;
    var nodes = root.querySelectorAll('div');
    for (var i = 0; i < nodes.length; i += 1) {
      var el = nodes[i];
      var t = el.textContent || '';
      if (t.length > 70) continue;
      var cfg = null;
      for (var k = 0; k < TABS.length; k += 1) {
        var cd = TABS[k];
        if (t.slice(0, cd.start.length) !== cd.start) continue;
        var allIn = true;
        for (var m = 0; m < cd.must.length; m += 1) if (t.indexOf(cd.must[m]) < 0) { allIn = false; break; }
        if (allIn) { cfg = cd; break; }
      }
      if (!cfg) continue;
      var card = el.parentElement;
      if (!card || el.__krDone) continue;
      if ((card.textContent || '').indexOf(cfg.cardMark) < 0) continue;

      el.__krDone = 1;
      var store = [];
      /* 数字行 + 三环图 +（小区）脚注 */
      hideNode(el, store);
      var ring = el.nextElementSibling;
      if (isRingRow(ring)) {
        hideNode(ring, store);
        var foot = ring.nextElementSibling;
        if (cfg.hideFoot && isFootRow(foot)) hideNode(foot, store);
      }

      var g = buildGrid(cfg);
      g.__krHidden = store;
      card.insertBefore(g, el);
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
  window.__krStatHook = 'v3';
})();
