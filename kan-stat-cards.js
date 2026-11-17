/* 客户看管 · 总览：统计区 6 卡化（两列三行）
   - 个人 · 总览：「看结果」卡片内 客户规模/宽带客户规模/离网客户规模 + 三环图 → 6 卡
   - 小区 · 总览：在管小区/关联客户/异动关注 + 三环图 + 脚注 → 6 卡
   - 园楼 · 总览：在管园楼/关联客户/异动关注 + 三环图 + 脚注 → 6 卡
   - 家庭 · 总览：在管家庭/宽带家庭/融合家庭 + 三环图 + 脚注 → 6 卡
   - 集团 · 总览：集团数量/AB集团/集团成员/全球通客户 + 三环图 + 脚注 → 6 卡
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
    },
    {
      key: 'ji',
      start: '在管家庭',
      must: ['宽带家庭', '融合家庭'],
      cardMark: '服务闭环率',
      hideFoot: true,
      data: [
        ['在管家庭数', '2378', 'p'],
        ['移动宽带家庭数', '2378', 'r'],
        ['外网宽带家庭数', '1,600', 'p'],
        ['融合家庭数', '2378', 'r'],
        ['融合渗透率', '89.01%', 'p'],
        ['宽带覆盖率', '89.01%', 'r']
      ]
    },
    {
      key: 'grp',
      start: '集团数量',
      must: ['AB集团数量', '集团成员数量', '全球通客户数量'],
      cardMark: '看管覆盖率',
      hideFoot: true,
      data: [
        ['在管集团数', '2378', 'p'],
        ['AB集团数量', '2378', 'r'],
        ['集团成员数', '1,600', 'p'],
        ['全球通客户数', '2378', 'r'],
        ['合约客户数', '1,600', 'p'],
        ['看管覆盖率', '89.01%', 'r']
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
  var TYPE_KEY = { '个人': 'per', '小区': 'xq', '园楼': 'yl', '集团': 'grp', '家庭': 'ji' };
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

  function isRingRow(n) {
    if (!n) return false;
    var t = n.textContent || '';
    if (t.length > 60) return false;
    return t.indexOf('保有率') >= 0 || t.indexOf('健康率') >= 0 || t.indexOf('覆盖率') >= 0;
  }

  function isFootRow(n) {
    if (!n) return false;
    var t = (n.textContent || '').trim();
    if (t.indexOf('统计仅包含') === 0 && t.length < 100) return true;
    return t.indexOf('家庭成员关系为合成演示') === 0 && t.length < 100;
  }

  /* 离开「总览」/ 换页签时还原原生内容（仅在当前页签没有 6 卡配置时用） */
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

  function cfgOf(key) {
    for (var i = 0; i < TABS.length; i += 1) if (TABS[i].key === key) return TABS[i];
    return null;
  }

  function matchCfg(t) {
    for (var k = 0; k < TABS.length; k += 1) {
      var cd = TABS[k];
      if (t.slice(0, cd.start.length) !== cd.start) continue;
      var allIn = true;
      for (var m = 0; m < cd.must.length; m += 1) if (t.indexOf(cd.must[m]) < 0) { allIn = false; break; }
      if (allIn) return cd;
    }
    return null;
  }

  /* 扫一遍当前页签的原生统计块并隐藏，返回锚点（优先「真的可见」的那份）+ 隐藏清单。
     要点：
     1) 只取「最内层」命中：行被隐藏后，它的外层卡片 textContent 也以同样前缀开头，
        若不过滤会把整张卡片（连同我们插入的 grid）一起藏掉；
     2) 命中的元素一律隐藏，但锚点优先选可见的，避免挂到另一份隐藏的旧页面上。 */
  function sweep(cfg, oldStore) {
    var root = document.getElementById('root');
    var out = { first: null, firstVisible: null, store: [] };
    if (!root) return out;
    var nodes = root.querySelectorAll('div');
    var hits = [];
    for (var i = 0; i < nodes.length; i += 1) {
      var el = nodes[i];
      if (el.closest && el.closest('#' + GRID_ID + ',#subYdPanel,#subYdTabs')) continue;
      var t = el.textContent || '';
      if (t.length > 70) continue;
      var c = matchCfg(t);
      if (!c || c.key !== cfg.key) continue;
      hits.push(el);
    }
    for (var h = 0; h < hits.length; h += 1) {
      var node = hits[h];
      var isWrapper = false;
      for (var h2 = 0; h2 < hits.length; h2 += 1) {
        if (h2 !== h && node.contains(hits[h2])) { isWrapper = true; break; }
      }
      if (isWrapper) continue;

      var card = node.parentElement;
      if (!card) continue;
      if ((card.textContent || '').indexOf(cfg.cardMark) < 0) continue;

      node.__krDone = 1;
      var anchor = { card: card, el: node };
      if (!out.first) out.first = anchor;
      if (!out.firstVisible && node.getClientRects().length) out.firstVisible = anchor;
      if (node.style.display !== 'none') node.style.display = 'none';
      out.store.push(node);
      var ring = node.nextElementSibling;
      if (isRingRow(ring)) {
        ring.__krDone = 1;
        if (ring.style.display !== 'none') ring.style.display = 'none';
        out.store.push(ring);
        var foot = ring.nextElementSibling;
        if (cfg.hideFoot && isFootRow(foot)) {
          foot.__krDone = 1;
          if (foot.style.display !== 'none') foot.style.display = 'none';
          out.store.push(foot);
        }
      }
    }
    if (oldStore && oldStore.length) {
      for (var j = 0; j < oldStore.length; j += 1) {
        var n = oldStore[j];
        if (n && n.parentNode && out.store.indexOf(n) < 0) {
          if (n.style.display !== 'none') n.style.display = 'none';
          out.store.push(n);
        }
      }
    }
    return out;
  }

  function fixHidden(g) {
    var hidden = g.__krHidden || [];
    for (var i = 0; i < hidden.length; i += 1) {
      if (hidden[i] && hidden[i].parentNode && hidden[i].style.display !== 'none') hidden[i].style.display = 'none';
    }
  }

  function cardsHTML(cfg) {
    var html = '';
    for (var i = 0; i < cfg.data.length; i += 1) {
      html += '<div class="kr-card"><div class="kr-txt"><div class="kr-t">' + cfg.data[i][0] + '</div>' +
        '<div class="kr-v">' + cfg.data[i][1] + '</div></div>' +
        (cfg.data[i][2] === 'p' ? penta() : round()) + '</div>';
    }
    return html;
  }

  var busy = false, again = false;

  function apply() {
    if (busy) { again = true; return; }
    busy = true;
    try {
      injectStyle();

      var type = activeTopType();
      var want;                                /* undefined = 过渡态，无法判断当前页签 */
      if (type) want = TYPE_KEY.hasOwnProperty(type) ? TYPE_KEY[type] : null;

      var grid = document.getElementById(GRID_ID);
      var gridKey = grid ? grid.getAttribute('data-kr') : null;

      if (want === undefined) { if (grid) fixHidden(grid); return; }
      if (want === null) { if (grid) restore(); return; }

      var cfg = cfgOf(want);
      if (!cfg) { if (grid) restore(); return; }

      var sw = sweep(cfg, grid ? grid.__krHidden : null);

      if (grid) {
        if (gridKey !== want) {                /* 换页签：就地换内容，绝不先还原原生块（否则会闪旧版式） */
          grid.innerHTML = cardsHTML(cfg);
          grid.setAttribute('data-kr', want);
        }
        grid.__krHidden = sw.store;
        var anchor0 = sw.firstVisible || sw.first;    /* 优先挂到「真的看得见」的那份页面 */
        if (anchor0 && grid.parentNode !== anchor0.card) {
          /* 各页签可能是各自独立的 DOM 子树：把 grid 搬到当前页的锚点位置 */
          anchor0.card.insertBefore(grid, anchor0.el);
          applySoon();
        } else if (anchor0 && !grid.getClientRects().length && anchor0.el.getClientRects().length) {
          applySoon();                                /* 位置对了但还没显示出来，下一帧再核一次 */
        }
        fixHidden(grid);
        return;
      }
      var anchor1 = sw.firstVisible || sw.first;
      if (!anchor1) return;                     /* 找不到目标行（可能在「XX异动」页）：等下一页 */
      var g = buildGrid(cfg);
      g.__krHidden = sw.store;
      anchor1.card.insertBefore(g, anchor1.el);
      fixHidden(g);
      applySoon();
    } finally {
      busy = false;
      if (again) { again = false; apply(); }
    }
  }

  function applySoon() {
    if (typeof requestAnimationFrame !== 'function') { apply(); return; }
    requestAnimationFrame(function () { apply(); });
  }

  function schedule() {
    /* MutationObserver 回调在微任务里执行，早于下一帧绘制：
       同步跑完 apply 才能保证切页签时不闪旧页面 */
    apply();
  }

  /* 点一级页签后连打几枪：RN 可能在点击后的不同时机才把新页面挂好，
     只靠 MutationObserver 容易漏掉「挂好但还没可见」的瞬间 */
  function burst() {
    var delays = [0, 40, 120, 260, 520, 900];
    for (var i = 0; i < delays.length; i += 1) setTimeout(apply, delays[i]);
  }
  document.addEventListener('click', function (e) {
    var t = e.target;
    var btn = t && t.closest ? t.closest('button') : null;
    if (!btn) return;
    if (TOP_NAMES.indexOf((btn.textContent || '').trim()) < 0) return;
    burst();
  }, true);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { apply(); });
  else apply();

  try {
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  setInterval(apply, 900);
  window.__krStatHook = 'v6';
})();
