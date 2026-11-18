/* 客户看管 · 小区/园楼/集团/家庭「明细列表」按网格重排
   ------------------------------------------------------------------
   原生名单是写死的演示数据（地址还是「拉萨市…」，与面包屑「昌都市-芒康县」矛盾），
   而且切换网格后不会变。这里把原生列表整段收起，用 kan-data.js 的数据重画一份：
     · 名称/地址/关联量都跟着网格走（如美 / 盐井 / 嘎托）
     · 搜索、分类筛选（全部 / 异动关注 / …）由本脚本自己实现
     · 点条目 → 打开该对象的「画像」（含成员信息） */
(function () {
  var STYLE_ID = 'krObjListStyle';
  var LIST_ID = 'krObjList';
  var TOP_TABS = ['个人', '小区', '园楼', '集团', '家庭'];
  var TYPE_KEY = { '小区': 'xq', '园楼': 'yl', '集团': 'grp', '家庭': 'ji' };
  var META = {
    '小区': { listTitle: '小区明细列表', unit: '个', chips: ['全部', '异动关注', '有宽带客户', '千兆小区'] },
    '园楼': { listTitle: '园楼明细列表', unit: '个', chips: ['全部', '异动关注', '有企业', '待建档'] },
    '集团': { listTitle: '集团明细列表', unit: '个', chips: ['全部', '异动关注', 'A类集团', 'B类集团'] },
    '家庭': { listTitle: '家庭明细列表', unit: '户', chips: ['全部', '异动关注', '宽带家庭', '融合家庭'] }
  };

  var CSS = [
    '#' + LIST_ID + '{display:flex;flex-direction:column;gap:12px;width:100%;box-sizing:border-box;padding:0 0 18px}',
    '#' + LIST_ID + ' .kl-head{display:flex;align-items:center;justify-content:space-between;gap:10px}',
    '#' + LIST_ID + ' .kl-left{display:flex;align-items:center;gap:8px}',
    '#' + LIST_ID + ' .kl-bar{width:3px;height:15px;border-radius:2px;background:#2069e8;display:block}',
    '#' + LIST_ID + ' .kl-title{font-size:16px;font-weight:800;color:#1f2733}',
    '#' + LIST_ID + ' .kl-link{font-size:12.5px;color:#1361ff;cursor:pointer}',
    '#' + LIST_ID + ' .kl-searchlabel{font-size:12.5px;color:#5b6472;margin-top:2px}',
    '#' + LIST_ID + ' .kl-search{display:flex;gap:10px;align-items:center}',
    '#' + LIST_ID + ' .kl-input{flex:1 1 auto;display:flex;align-items:center;height:40px;box-sizing:border-box;padding:0 12px;border:1px solid #e3e8f0;border-radius:8px;background:#fff}',
    '#' + LIST_ID + ' .kl-input input{border:0;outline:0;width:100%;font-size:13.5px;color:#333a45;background:transparent}',
    '#' + LIST_ID + ' .kl-input input::placeholder{color:#a8b0bc}',
    '#' + LIST_ID + ' .kl-filter{flex:0 0 auto;display:flex;align-items:center;gap:6px;height:40px;padding:0 14px;box-sizing:border-box;border:1px solid #dbe6f6;border-radius:8px;background:#fff;color:#2069e8;font-size:13.5px;cursor:pointer}',
    '#' + LIST_ID + ' .kl-filter.on{background:#eaf2ff;border-color:#b9d3fb;font-weight:600}',
    '#' + LIST_ID + ' .kl-filter svg{display:block}',
    '#' + LIST_ID + ' .kl-chips{display:flex;flex-wrap:wrap;gap:8px}',
    '#' + LIST_ID + ' .kl-chip{font-size:12.5px;color:#5b6472;background:#fff;border:1px solid #e3e8f0;border-radius:8px;padding:7px 14px;cursor:pointer;line-height:1}',
    '#' + LIST_ID + ' .kl-chip.on{color:#1361ff;border-color:#1361ff;font-weight:500}',
    '#' + LIST_ID + ' .kl-count{font-size:12.5px;color:#8a929e}',
    '#' + LIST_ID + ' .kl-items{display:flex;flex-direction:column;gap:12px}',
    '#' + LIST_ID + ' .kl-item{display:flex;flex-direction:column;gap:7px;box-sizing:border-box;padding:14px;border:1px solid #eef0f5;border-radius:12px;background:#fff;box-shadow:0 1px 2px rgba(24,37,58,.04);cursor:pointer}',
    '#' + LIST_ID + ' .kl-item:active{background:#fafcff}',
    '#' + LIST_ID + ' .kl-top{display:flex;align-items:center;justify-content:space-between;gap:8px}',
    '#' + LIST_ID + ' .kl-name{font-size:16px;font-weight:700;color:#1f2733}',
    '#' + LIST_ID + ' .kl-tag{flex:0 0 auto;font-size:11.5px;color:#4b8f5f;background:#eef8f1;border-radius:4px;padding:2px 7px}',
    '#' + LIST_ID + ' .kl-addr{font-size:12.5px;color:#8a929e}',
    '#' + LIST_ID + ' .kl-meta{font-size:12.5px;color:#6b7480}',
    '#' + LIST_ID + ' .kl-warn{font-size:12px;color:#e0432f;background:#fff2f0;border:1px solid #ffdcd6;border-radius:5px;padding:3px 8px;align-self:flex-start}',
    '#' + LIST_ID + ' .kl-hint{font-size:12.5px;color:#1361ff}',
    '#' + LIST_ID + ' .kl-empty{font-size:13px;color:#98a1ad;padding:24px 0;text-align:center}',
    '#' + LIST_ID + ' .kl-foot{font-size:12px;color:#a3abb6;text-align:left;padding-top:2px}',
    /* 筛选面板（筛选按钮 → 底部弹出） */
    '#klFilterMask{position:fixed;inset:0;z-index:9220;display:flex;align-items:flex-end;justify-content:center;background:rgba(16,24,40,.45);opacity:0;pointer-events:none;transition:opacity .22s ease}',
    '#klFilterMask.on{opacity:1;pointer-events:auto}',
    '#klFilterSheet{width:100%;max-width:520px;background:#fff;border-radius:16px 16px 0 0;padding:0 0 14px;box-sizing:border-box;transform:translateY(101%);transition:transform .26s cubic-bezier(.22,.61,.36,1);max-height:78vh;overflow:auto;font-family:inherit}',
    '#klFilterMask.on #klFilterSheet{transform:translateY(0)}',
    '#klFilterSheet .fs-head{display:flex;align-items:center;justify-content:center;position:relative;height:52px;border-bottom:1px solid #f0f2f6}',
    '#klFilterSheet .fs-head b{font-size:16px;font-weight:800;color:#1f2733}',
    '#klFilterSheet .fs-close{position:absolute;right:14px;top:0;height:52px;display:flex;align-items:center;font-size:20px;color:#9aa3af;cursor:pointer;padding:0 4px}',
    '#klFilterSheet .fs-sec{padding:14px 16px 2px}',
    '#klFilterSheet .fs-title{font-size:13px;color:#5b6472;margin-bottom:9px}',
    '#klFilterSheet .fs-chips{display:flex;flex-wrap:wrap;gap:9px}',
    '#klFilterSheet .fs-chip{font-size:13px;color:#4a5461;background:#f5f7fa;border:1px solid #f5f7fa;border-radius:8px;padding:9px 14px;line-height:1;cursor:pointer}',
    '#klFilterSheet .fs-chip.on{color:#1361ff;background:#eaf2ff;border-color:#1361ff;font-weight:600}',
    '#klFilterSheet .fs-foot{display:flex;gap:12px;padding:16px 16px 4px}',
    '#klFilterSheet .fs-reset{flex:0 0 34%;height:46px;display:flex;align-items:center;justify-content:center;border:1px solid #dfe4ec;border-radius:10px;color:#4a5461;font-size:15px;cursor:pointer;background:#fff}',
    '#klFilterSheet .fs-ok{flex:1 1 auto;height:46px;display:flex;align-items:center;justify-content:center;border-radius:10px;background:#1361ff;color:#fff;font-size:15px;font-weight:600;cursor:pointer}',
    '[data-kl-hidden]{display:none !important}'
  ].join('\n');

  var hidden = [];
  var listEl = null;
  var curType = null;
  var activeChip = '全部';
  var keyword = '';
  var sortMode = 'default';   /* default | links | name */
  var onlyWarn = false;
  var draft = { sort: 'default', warn: false };
  var SORTS = [['default', '默认排序'], ['links', '关联量从高到低'], ['name', '名称顺序']];
  var FILTER_ICON = '<svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">' +
    '<path d="M2 3.2h12M4.6 7.2h6.8M6.6 11.2h2.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  function filterOn() { return sortMode !== 'default' || onlyWarn; }

  function KAN() { return window.WGT_KAN || null; }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function activeTopType() {
    var btns = document.querySelectorAll('#root button');
    var found = null, foundW = -1;
    for (var i = 0; i < btns.length; i += 1) {
      var t = (btns[i].textContent || '').trim();
      if (TOP_TABS.indexOf(t) < 0) continue;
      if (!btns[i].getClientRects().length) continue;
      var inner = btns[i].querySelector('div') || btns[i];
      var m = (getComputedStyle(inner).color || '').match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (!m || !(+m[3] > +m[1] + 40 && +m[3] > 120)) continue;
      var w = btns[i].parentNode ? btns[i].parentNode.getBoundingClientRect().width : 0;
      if (w > foundW) { found = t; foundW = w; }
    }
    return found;
  }

  function scrollParentOf(n) {
    var p = n.parentNode;
    while (p && p !== document.body) {
      var ov = getComputedStyle(p).overflowY;
      if (ov === 'auto' || ov === 'scroll' || ov === 'overlay') return p;
      p = p.parentNode;
    }
    return null;
  }

  /* 找「XX明细列表」标题行（原生） */
  /* 原生列表标题：「小区明细列表」「看护集团列表」两种口径都算；RN 会保留多份页面副本 */
  function findNativeHeaders(type) {
    var re = new RegExp('^(看护|管理)?' + type + '(明细|看护|管理)?列表(编辑表头|编辑)?$');
    var els = document.querySelectorAll('#root div');
    var out = [];
    for (var i = 0; i < els.length; i += 1) {
      var el = els[i];
      if (el.closest && el.closest('#' + LIST_ID)) continue;
      var t = (el.textContent || '').trim();
      if (!re.test(t)) continue;
      var nested = false;
      for (var k = 0; k < out.length; k += 1) if (out[k].contains(el)) nested = true;
      if (nested) continue;
      for (var j = out.length - 1; j >= 0; j -= 1) if (el.contains(out[j])) out.splice(j, 1);
      out.push(el);
    }
    return out;
  }

  /* 原生列表的其余部件（标题之外的搜索框、分类、计数、条目、页脚）在不同的子树里，
     逐个按文本特征打标记隐藏，比「隐藏标题的后续兄弟」稳。 */
  function markEl(n) {
    if (!n || !n.getAttribute) return;
    if (n.id === LIST_ID) return;
    if (n.closest && n.closest('#' + LIST_ID)) return;
    if (getComputedStyle(n).position === 'fixed') return;
    var txt = n.textContent || '';
    if (txt.indexOf('工作台') >= 0 && txt.indexOf('营销作战') >= 0) return;
    if ((txt.indexOf('快捷查询') >= 0) || (txt.indexOf('总览') >= 0 && txt.indexOf('异动') >= 0)) return;
    n.setAttribute('data-kl-hidden', '1');
    hidden.push(n);
  }

  function markNativeChrome(type) {
    var els = document.querySelectorAll('#root div');
    var countRe = new RegExp('^' + type + '对象 · \\d+ (个|户) · .+$');
    for (var i = 0; i < els.length; i += 1) {
      var el = els[i];
      if (el.closest && el.closest('#' + LIST_ID)) continue;
      if ([].some.call(el.children, function (c) { return c.id === LIST_ID; })) continue;
      var txt = (el.textContent || '').trim();
      if (!txt || txt.length > 240) continue;
      var hit = false;
      if (txt === '搜索' + type) hit = true;
      else if (/^全部/.test(txt) && txt.length < 32 && txt.indexOf('对象') < 0) hit = true;
      else if (countRe.test(txt)) hit = true;
      else if (/^本地演示数据 · \d+ 条$/.test(txt)) hit = true;
      else if (/^编辑表头$/.test(txt)) hit = true;
      else if (txt.indexOf(type + '名称、地址') >= 0 && el.querySelector('input')) hit = true;
      else if ((txt.indexOf('查看成员、标签与关联信息') >= 0 || txt.indexOf('查看家庭成员与关联信息') >= 0) && txt.length < 300) hit = true;
      if (hit) markEl(el);
    }
    /* 原生「搜索X ｜ 筛选」行：输入框被收起后，筛选按钮会孤零零掉到列表最下面（用户反馈的「按钮跑最下面」），
       这里把原生筛选按钮连同它的空行一起收起，只保留我们自己重画的右上角「筛选」。 */
    var btns = document.querySelectorAll('#root button');
    for (var b = 0; b < btns.length; b += 1) {
      var bt = btns[b];
      if (bt.closest && bt.closest('#' + LIST_ID)) continue;
      if ((bt.textContent || '').trim() !== '筛选') continue;
      markEl(bt);
      var row = bt.parentNode;
      if (!row || !row.children) continue;
      var left = 0;
      for (var c = 0; c < row.children.length; c += 1) {
        var ch = row.children[c];
        if (ch === bt) continue;
        if (ch.getAttribute('data-kl-hidden') !== '1') left += 1;
      }
      if (!left) markEl(row);
    }
  }

  function showHidden() {
    for (var i = 0; i < hidden.length; i += 1) {
      var n = hidden[i];
      if (n && n.parentNode && n.getAttribute('data-kl-hidden') === '1') {
        n.removeAttribute('data-kl-hidden');
      }
    }
    hidden = [];
  }

  function chipsOf(type) { return META[type].chips; }

  function itemAttrs(type, org, idx, warnNames) {
    var attrs = ['全部'];
    if (warnNames[org.name]) attrs.push('异动关注');
    if (type === 'xq') {
      if (idx % 3 !== 0) attrs.push('有宽带客户');
      if (idx % 2 === 0) attrs.push('千兆小区');
    } else if (type === 'yl') {
      attrs.push('有企业');
      if (idx % 4 === 0) attrs.push('待建档');
    } else if (type === 'grp') {
      attrs.push(org.chip === 'B类集团' ? 'B类集团' : 'A类集团');
    } else {
      if (idx % 3 !== 0) attrs.push('宽带家庭');
      if (idx % 2 === 0) attrs.push('融合家庭');
    }
    return attrs;
  }

  /* 汇总当前类型下满足「分类 chip + 关键词 + 筛选面板」的对象；筛选面板与列表共用，保证数字一致 */
  function collect(type, opt) {
    var k = KAN();
    if (!k) return [];
    opt = opt || {};
    var kw = (opt.kw === undefined ? keyword : opt.kw).trim();
    var chip = opt.chip === undefined ? activeChip : opt.chip;
    var warnOnly = opt.warn === undefined ? onlyWarn : opt.warn;
    var sort = opt.sort === undefined ? sortMode : opt.sort;
    var orgs = k.orgs(TYPE_KEY[type]);
    var yd = k.yd(TYPE_KEY[type]);
    var warnNames = {};
    (yd.items || []).forEach(function (it) { warnNames[it.name] = true; });

    var rows = [];
    for (var i = 0; i < orgs.length; i += 1) {
      var org = orgs[i];
      var attrs = itemAttrs(type, org, i, warnNames);
      if (chip !== '全部' && attrs.indexOf(chip) < 0) continue;
      if (warnOnly && !warnNames[org.name]) continue;
      if (kw) {
        var hay = org.name + org.addr + org.meta;
        if (hay.indexOf(kw) < 0) continue;
      }
      rows.push({ org: org, warn: !!warnNames[org.name], idx: i, attrs: attrs });
    }
    if (sort === 'links') {
      rows.sort(function (a, b) { return (b.org.links - a.org.links) || (a.idx - b.idx); });
    } else if (sort === 'name') {
      rows.sort(function (a, b) { return String(a.org.name).localeCompare(String(b.org.name), 'zh'); });
    }
    return rows;
  }

  /* ---------- 筛选面板（点右上「筛选」弹出，排序 + 仅看异动关注） ---------- */
  var maskEl = null;

  function ensureSheet() {
    injectStyle();
    if (maskEl && maskEl.parentNode) return maskEl;
    maskEl = document.createElement('div');
    maskEl.id = 'klFilterMask';
    maskEl.addEventListener('click', function (e) {
      if (e.target === maskEl) { closeSheet(); return; }
      var chip = e.target.closest ? e.target.closest('.fs-chip') : null;
      if (chip) {
        var grp = chip.getAttribute('data-grp');
        if (grp === 'sort') draft.sort = chip.getAttribute('data-val');
        else draft.warn = chip.getAttribute('data-val') === '1';
        paintSheet();
        return;
      }
      if (e.target.closest && e.target.closest('.fs-close')) { closeSheet(); return; }
      if (e.target.closest && e.target.closest('.fs-reset')) { draft = { sort: 'default', warn: false }; paintSheet(); return; }
      if (e.target.closest && e.target.closest('.fs-ok')) {
        sortMode = draft.sort;
        onlyWarn = draft.warn;
        closeSheet();
        render();
      }
    }, false);
    document.body.appendChild(maskEl);
    return maskEl;
  }

  function paintSheet() {
    if (!maskEl || !curType) return;
    var n = collect(curType, { sort: draft.sort, warn: draft.warn }).length;
    var html =
      '<div id="klFilterSheet">' +
        '<div class="fs-head"><b>筛选</b><span class="fs-close">×</span></div>' +
        '<div class="fs-sec"><div class="fs-title">排序方式</div><div class="fs-chips">' +
          SORTS.map(function (s) {
            return '<span class="fs-chip' + (draft.sort === s[0] ? ' on' : '') + '" data-grp="sort" data-val="' + s[0] + '">' + s[1] + '</span>';
          }).join('') +
        '</div></div>' +
        '<div class="fs-sec"><div class="fs-title">对象范围</div><div class="fs-chips">' +
          '<span class="fs-chip' + (!draft.warn ? ' on' : '') + '" data-grp="warn" data-val="0">全部' + curType + '对象</span>' +
          '<span class="fs-chip' + (draft.warn ? ' on' : '') + '" data-grp="warn" data-val="1">仅异动关注</span>' +
        '</div></div>' +
        '<div class="fs-foot"><div class="fs-reset">重置</div><div class="fs-ok">确定（' + n + '）</div></div>' +
      '</div>';
    maskEl.innerHTML = html;
  }

  function openSheet() {
    ensureSheet();
    draft = { sort: sortMode, warn: onlyWarn };
    paintSheet();
    maskEl.classList.remove('on');
    void maskEl.offsetHeight;
    maskEl.classList.add('on');
  }

  function closeSheet() {
    if (!maskEl) return;
    maskEl.classList.remove('on');
  }

  function render() {
    if (!listEl || !curType) return;
    var k = KAN();
    if (!k) return;
    var type = curType;
    var rows = collect(type);

    var head =
      '<div class="kl-head"><div class="kl-left"><i class="kl-bar"></i><span class="kl-title">' + (listEl.__title || META[type].listTitle) + '</span></div>' +
      '<span class="kl-link" data-act="edit">编辑表头</span></div>' +
      '<div class="kl-searchlabel">搜索' + type + '</div>' +
      '<div class="kl-search"><div class="kl-input"><input id="klSearch" placeholder="' + type + '名称、地址、看管人" value="' + keyword.replace(/"/g, '&quot;') + '"></div>' +
      '<div class="kl-filter' + (filterOn() ? ' on' : '') + '" data-act="filter">' + FILTER_ICON + '<span>筛选</span></div></div>' +
      '<div class="kl-chips">' + chipsOf(type).map(function (c) {
        return '<span class="kl-chip' + (c === activeChip ? ' on' : '') + '" data-chip="' + c + '">' + c + '</span>';
      }).join('') + '</div>' +
      '<div class="kl-count">' + type + '对象 · ' + rows.length + ' ' + META[type].unit + ' · 所辖网格范围' +
      (filterOn() ? ' · 已筛选' : '') + '</div>';

    var items = rows.map(function (r) {
      var o = r.org;
      return '<div class="kl-item" data-org="' + o.name + '">' +
        '<div class="kl-top"><span class="kl-name">' + o.name + '</span><span class="kl-tag">' + o.chip + '</span></div>' +
        '<div class="kl-addr">' + o.addr + '</div>' +
        (r.warn ? '<div class="kl-warn">异动关注 · 待人工核实</div>' : '') +
        '<div class="kl-meta">' + o.meta + '</div>' +
        '<div class="kl-hint">查看成员、标签与关联信息 →</div></div>';
    }).join('');

    listEl.innerHTML = head + '<div class="kl-items">' + (items || '<div class="kl-empty">当前筛选下暂无' + type + '对象</div>') + '</div>' +
      '<div class="kl-foot">本地演示数据 · ' + rows.length + ' 条</div>';
  }

  function bind() {
    if (!listEl) return;
    listEl.addEventListener('input', function (e) {
      if (e.target.id !== 'klSearch') return;
      keyword = e.target.value || '';
      var pos = e.target.selectionStart;
      render();
      var box = document.getElementById('klSearch');
      if (box) { box.focus(); try { box.setSelectionRange(pos, pos); } catch (err) {} }
    });
    listEl.addEventListener('click', function (e) {
      var chip = e.target.closest ? e.target.closest('.kl-chip') : null;
      if (chip) { activeChip = chip.getAttribute('data-chip'); render(); return; }
      var item = e.target.closest ? e.target.closest('.kl-item') : null;
      if (item) {
        var nm = item.getAttribute('data-org');
        if (nm && typeof window.__openOrgProfile === 'function') window.__openOrgProfile(TYPE_KEY[curType], nm);
        return;
      }
      var act = e.target.closest ? e.target.closest('[data-act]') : null;
      if (act) {
        if (act.getAttribute('data-act') === 'filter') { openSheet(); e.stopPropagation(); e.preventDefault(); }
        return;
      }
    }, true);
  }

  function ensure(type) {
    injectStyle();
    if (!listEl) { listEl = document.createElement('div'); listEl.id = LIST_ID; listEl.setAttribute('data-kl-mine', '1'); bind(); }
    var natives = findNativeHeaders(type);
    if (!natives.length) return false;
    hidden = [];
    var anchor = null;
    for (var i = 0; i < natives.length; i += 1) {
      markEl(natives[i]);
      if (!anchor && natives[i].parentNode) anchor = natives[i];
    }
    markNativeChrome(type);
    if (!anchor) return false;
    if (listEl.parentNode !== anchor.parentNode) anchor.parentNode.insertBefore(listEl, anchor);
    var t = (anchor.textContent || '').trim().replace(/编辑表头|编辑/g, '');
    listEl.__title = t || META[type].listTitle;
    return true;
  }

  function cleanup() {
    showHidden();
    closeSheet();
    if (listEl) listEl.__sig = '';
    if (listEl && listEl.parentNode) listEl.parentNode.removeChild(listEl);
    curType = null;
    activeChip = '全部';
    keyword = '';
    sortMode = 'default';
    onlyWarn = false;
  }

  var busy = false, again = false;
  function apply() {
    if (busy) { again = true; return; }
    busy = true;
    try {
      var type = activeTopType();
      if (!type || !TYPE_KEY[type]) {
        if (listEl) cleanup();
        return;
      }
      /* 只在「总览」时接管（异动视图由 subtab-yidong 负责） */
      var onYd = false;
      var tabs = document.querySelectorAll('#subYdTabs .sy-tab');
      for (var i = 0; i < tabs.length; i += 1) {
        if (tabs[i].classList.contains('on') && tabs[i].getAttribute('data-sub') === 'yd') onYd = true;
      }
      if (onYd) { if (listEl) { listEl.style.display = 'none'; } return; }
      if (listEl) listEl.style.display = '';

      if (curType && curType !== type) { activeChip = '全部'; keyword = ''; sortMode = 'default'; onlyWarn = false; closeSheet(); }
      curType = type;
      if (!ensure(type)) return;
      var sig = KAN() ? KAN().grid() : '';
      if (listEl.__sig !== sig + '|' + type) {
        listEl.__sig = sig + '|' + type;
        activeChip = '全部';
        keyword = '';
        render();
      } else if (!listEl.children.length) {
        render();
      }
    } finally {
      busy = false;
      if (again) { again = false; apply(); }
    }
  }

  var timer = setInterval(function () { try { apply(); } catch (e) {} }, 320);
  try {
    new MutationObserver(function () { try { apply(); } catch (e) {} }).observe(document.documentElement, { childList: true, subtree: true });
  } catch (e) {}
  window.addEventListener('wgt:grid-change', function () { activeChip = '全部'; keyword = ''; sortMode = 'default'; onlyWarn = false; closeSheet(); try { apply(); } catch (e) {} });
  document.addEventListener('click', function (e) {
    var t = e.target;
    var btn = t && t.closest ? t.closest('button') : null;
    if (!btn) return;
    if (TOP_TABS.indexOf((btn.textContent || '').trim()) < 0) return;
    [0, 60, 180, 400, 800].forEach(function (d) { setTimeout(function () { try { apply(); } catch (err) {} }, d); });
  }, true);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  void timer;
  window.__krObjListHook = 'v3';
  window.__krObjListDebug = function (type) {
    var t = type || curType;
    var ns = findNativeHeaders(t);
    return {
      type: t,
      candidates: ns.map(function (n) {
        return { t: (n.textContent || '').trim().slice(0, 24), vis: n.getClientRects().length, mark: n.getAttribute('data-kl-hidden') || '' };
      }),
      hidden: hidden.length,
      listVisible: listEl ? listEl.getClientRects().length : 0,
      listTitle: listEl ? listEl.__title : ''
    };
  };
})();
