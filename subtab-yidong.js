/* 客户看管 · 小区/园楼/集团/家庭：增加「总览 / XX异动」子页签（样式与「个人」一致）
   异动视图先按「个人 · 客户异动」的样式 1:1 复刻：看异动 6 卡 + 异动对象列表 + 点击卡片筛选（再次点击取消）。 */
(function () {
  var STYLE_ID = 'subYdStyle';
  var ROW_ID = 'subYdTabs';
  var PANEL_ID = 'subYdPanel';
  var TOP_TABS = ['个人', '小区', '园楼', '集团', '家庭'];

  /* ---------- 数据 ---------- */
  var METRICS = [
    '当月携出客户数', '当月降档客户数', '当月离网客户数',
    '当月投诉客户数', '当月解约客户数', '流失预警客户数'
  ];
  var TAGS = ['当月携出', '当月降档', '当月离网', '当月投诉', '当月解约', '流失预警'];
  var TAG_UNIT = ['1 户', '1 户', '1 户', '2 起', '1 户', '2 户'];

  var DATA = {
    '小区': {
      label: '小区', unit: '个', listTitle: '异动小区列表', searchLabel: '搜索小区',
      placeholder: '小区名称、地址、看管人',
      items: [
        { name: '八廓街示范小区', chip: '小区', addr: '拉萨市八廓街20号（演示）', meta: '关联客户 7 · 看管人 张明' },
        { name: '江苏路示范小区', chip: '小区', addr: '拉萨市江苏路22号（演示）', meta: '关联客户 6 · 看管人 张明' },
        { name: '吉日街道示范小区', chip: '小区', addr: '拉萨市吉日街道21号（演示）', meta: '关联客户 7 · 看管人 张明' }
      ]
    },
    '园楼': {
      label: '园楼', unit: '个', listTitle: '异动园楼列表', searchLabel: '搜索园楼',
      placeholder: '园楼名称、地址、看管人',
      items: [
        { name: '江苏路产业园', chip: '园楼', addr: '拉萨市江苏路22号（演示）', meta: '关联客户 3 · 看管人 张明' },
        { name: '吉日街道商务楼', chip: '园楼', addr: '拉萨市吉日街道21号（演示）', meta: '关联客户 4 · 看管人 张明' },
        { name: '八廓街产业园', chip: '园楼', addr: '拉萨市八廓街20号（演示）', meta: '关联客户 4 · 看管人 张明' },
        { name: '八廓街商务楼', chip: '园楼', addr: '拉萨市八廓街23号（演示）', meta: '关联客户 3 · 看管人 张明' },
        { name: '江苏路商务楼', chip: '园楼', addr: '拉萨市江苏路25号（演示）', meta: '关联客户 3 · 看管人 张明' },
        { name: '吉日街道产业园', chip: '园楼', addr: '拉萨市吉日街道24号（演示）', meta: '关联客户 3 · 看管人 张明' }
      ]
    },
    '集团': {
      label: '集团', unit: '个', listTitle: '异动集团列表', searchLabel: '搜索集团',
      placeholder: '请输入集团编码或名称',
      items: [
        { name: '雪域教育集团', chip: 'A类集团', addr: '拉萨市江苏路22号（演示）', meta: '集团编码 6805938 · 成员客户 2 位' },
        { name: '城关商贸集团', chip: 'B类集团', addr: '拉萨市八廓街23号（演示）', meta: '集团编码 1453060 · 成员客户 2 位' },
        { name: '高原水务集团', chip: 'A类集团', addr: '拉萨市八廓街26号（演示）', meta: '集团编码 1475518 · 成员客户 2 位' },
        { name: '雪莲医药集团', chip: 'A类集团', addr: '拉萨市江苏路28号（演示）', meta: '集团编码 1951502 · 成员客户 2 位' },
        { name: '拉萨能源集团', chip: 'B类集团', addr: '拉萨市八廓街29号（演示）', meta: '集团编码 8061690 · 成员客户 2 位' },
        { name: '拉萨物流集团', chip: 'B类集团', addr: '拉萨市吉日街道21号（演示）', meta: '集团编码 4392836 · 成员客户 2 位' },
        { name: '藏源农牧集团', chip: 'A类集团', addr: '拉萨市吉日街道24号（演示）', meta: '集团编码 6287854 · 成员客户 2 位' },
        { name: '城关建筑集团', chip: 'A类集团', addr: '拉萨市吉日街道27号（演示）', meta: '集团编码 7564302 · 成员客户 2 位' },
        { name: '拉萨文旅集团', chip: 'B类集团', addr: '拉萨市江苏路26号（演示）', meta: '集团编码 5127043 · 成员客户 2 位' },
        { name: '城关物业集团', chip: 'B类集团', addr: '拉萨市吉日街道29号（演示）', meta: '集团编码 3378915 · 成员客户 2 位' }
      ]
    },
    '家庭': {
      label: '家庭', unit: '个', listTitle: '异动家庭列表', searchLabel: '搜索家庭',
      placeholder: '家庭联系人、地址、看管人',
      items: [
        { name: '陈霞', chip: '家庭', addr: '拉萨市江苏路28号（演示）', meta: '189****2108 · 家庭成员 2 位 · 未覆盖宽带' },
        { name: '赵静', chip: '家庭', addr: '拉萨市江苏路34号（演示）', meta: '189****2114 · 家庭成员 2 位 · 未覆盖宽带' },
        { name: '德吉', chip: '家庭', addr: '拉萨市吉日街道21号（演示）', meta: '189****2101 · 家庭成员 2 位 · 已覆盖宽带' },
        { name: '张丽', chip: '家庭', addr: '拉萨市八廓街26号（演示）', meta: '189****2106 · 家庭成员 2 位 · 融合家庭' },
        { name: '格桑', chip: '家庭', addr: '拉萨市吉日街道33号（演示）', meta: '189****2113 · 家庭成员 2 位 · 已覆盖宽带' },
        { name: '吴敏', chip: '家庭', addr: '拉萨市八廓街38号（演示）', meta: '189****2118 · 家庭成员 1 位 · 融合家庭' },
        { name: '李雪', chip: '家庭', addr: '拉萨市江苏路22号（演示）', meta: '189****2102 · 家庭成员 2 位 · 未覆盖宽带' },
        { name: '扎西', chip: '家庭', addr: '拉萨市八廓街20号（演示）', meta: '189****2100 · 家庭成员 2 位 · 融合家庭' },
        { name: '索朗', chip: '家庭', addr: '拉萨市吉日街道27号（演示）', meta: '189****2107 · 家庭成员 2 位 · 已覆盖宽带' },
        { name: '周强', chip: '家庭', addr: '拉萨市八廓街32号（演示）', meta: '189****2112 · 家庭成员 2 位 · 融合家庭' },
        { name: '尼玛', chip: '家庭', addr: '拉萨市江苏路25号（演示）', meta: '189****2109 · 家庭成员 2 位 · 未覆盖宽带' }
      ]
    }
  };

  /* 每对象挂 2 类异动，保证每张卡都有命中对象 */
  Object.keys(DATA).forEach(function (k) {
    DATA[k].items.forEach(function (it, i) {
      it.cats = [i % 6, (i + 3) % 6];
    });
  });

  var FUNNEL = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">' +
    '<path d="M3.5 5.2h17l-6.4 7.4v5.6l-4.2 2v-7.6L3.5 5.2Z" stroke="#2069e8" stroke-width="1.6" stroke-linejoin="round"/></svg>';

  var WARN = '<svg class="sy-warn" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><linearGradient id="syWarnG" x1="0" y1="0" x2="0" y2="1">' +
    '<stop offset="0" stop-color="#ff5a63"/><stop offset="1" stop-color="#ef2f38"/></linearGradient></defs>' +
    '<path d="M11.1 3.3a1 1 0 0 1 1.8 0l8.4 16.1a1 1 0 0 1-.9 1.5H3.6a1 1 0 0 1-.9-1.5L11.1 3.3Z" fill="url(#syWarnG)"/>' +
    '<rect x="10.7" y="9.2" width="2.6" height="6" rx="1.3" fill="#ffffff"/>' +
    '<circle cx="12" cy="18.2" r="1.5" fill="#ffffff"/>' +
    '</svg>';

  var CSS = [
    /* 子页签：与「个人」页完全一致（#eaf5ff 底、8px 圆角、4px 内边距、选中白底蓝字） */
    '#' + ROW_ID + '{display:flex;box-sizing:border-box;width:100%;margin:10px 0 0;padding:4px;background:#eaf5ff;border-radius:8px;height:52px}',
    '#' + ROW_ID + ' .sy-tab{flex:1 1 0;display:flex;align-items:center;justify-content:center;height:44px;border-radius:8px;',
    '  font-size:14px;color:#5b6472;cursor:pointer;user-select:none;transition:background .16s,color .16s,box-shadow .16s;white-space:nowrap}',
    '#' + ROW_ID + ' .sy-tab.on{background:#fff;color:#1361ff;font-weight:600;box-shadow:0 1px 4px rgba(19,97,255,.12)}',

    /* 面板 */
    '#' + PANEL_ID + '{width:100%;box-sizing:border-box;display:flex;flex-direction:column;gap:10px;padding:12px 0 24px}',
    '#' + PANEL_ID + ' .sy-head{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;box-sizing:border-box}',
    '#' + PANEL_ID + ' .sy-left{display:flex;align-items:center;gap:8px}',
    '#' + PANEL_ID + ' .sy-bar{width:3px;height:15px;border-radius:2px;background:#2069e8;display:block}',
    '#' + PANEL_ID + ' .sy-title{font-size:16px;font-weight:800;color:#1f2733;letter-spacing:.2px}',
    '#' + PANEL_ID + ' .sy-links{display:flex;align-items:center;gap:8px;font-size:12.5px;color:#7b8491;white-space:nowrap}',
    '#' + PANEL_ID + ' .sy-links .lnk{color:#2069e8;cursor:pointer}',
    '#' + PANEL_ID + ' .sy-links .sep{color:#d8dee7}',

    '#' + PANEL_ID + ' .sy-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;box-sizing:border-box}',
    '#' + PANEL_ID + ' .sy-card{position:relative;display:flex;flex-direction:column;justify-content:space-between;gap:6px;box-sizing:border-box;',
    '  min-height:72px;padding:10px 12px 9px;border-radius:8px;border:1px solid #fbe3e7;cursor:pointer;text-align:left;',
    '  background:linear-gradient(90deg,#fffdfd 0%,#fde8ec 100%);transition:border-color .16s,box-shadow .16s,background .16s}',
    '#' + PANEL_ID + ' .sy-card:hover{border-color:#f4bcc3}',
    '#' + PANEL_ID + ' .sy-card.on{border-color:#e8332a;background:linear-gradient(90deg,#fff9fa 0%,#fcdbe1 100%);box-shadow:0 0 0 1px #e8332a inset}',
    '#' + PANEL_ID + ' .sy-top{display:flex;align-items:flex-start;justify-content:space-between;gap:6px}',
    '#' + PANEL_ID + ' .sy-name{font-size:13.5px;line-height:1.25;color:#333a45;white-space:nowrap}',
    '#' + PANEL_ID + ' .sy-warn{flex:0 0 12px;width:12px;height:12px;display:block;margin-top:2px}',
    '#' + PANEL_ID + ' .sy-bottom{display:flex;align-items:baseline;justify-content:space-between;gap:6px}',
    '#' + PANEL_ID + ' .sy-num{font-size:19px;line-height:1.1;color:#20262f;font-weight:500;letter-spacing:.3px}',
    '#' + PANEL_ID + ' .sy-yday{font-size:11.5px;color:#98a1ad;white-space:nowrap}',
    '#' + PANEL_ID + ' .sy-yday b{color:#e8332a;font-weight:800;margin-left:3px}',

    /* 搜索 + 列表 */
    '#' + PANEL_ID + ' .sy-sec{margin-top:6px}',
    '#' + PANEL_ID + ' .sy-searchlabel{font-size:12.5px;color:#5b6472;margin:0 0 8px}',
    '#' + PANEL_ID + ' .sy-search{display:flex;gap:10px;align-items:center;width:100%}',
    '#' + PANEL_ID + ' .sy-input{flex:1 1 auto;display:flex;align-items:center;height:40px;box-sizing:border-box;padding:0 12px;',
    '  border:1px solid #e3e8f0;border-radius:8px;background:#fff}',
    '#' + PANEL_ID + ' .sy-input input{border:0;outline:0;width:100%;font-size:13.5px;color:#333a45;background:transparent}',
    '#' + PANEL_ID + ' .sy-input input::placeholder{color:#a8b0bc}',
    '#' + PANEL_ID + ' .sy-filter{flex:0 0 auto;display:flex;align-items:center;gap:6px;height:40px;padding:0 16px;box-sizing:border-box;',
    '  border:1px solid #dbe6f6;border-radius:8px;background:#fff;color:#2069e8;font-size:13.5px;cursor:pointer}',
    '#' + PANEL_ID + ' .sy-count{font-size:12.5px;color:#8a929e;margin:2px 0 4px}',
    '#' + PANEL_ID + ' .sy-item{display:flex;flex-direction:column;gap:6px;box-sizing:border-box;padding:13px 14px;',
    '  border:1px solid #eef0f5;border-radius:10px;background:#fff;box-shadow:0 1px 2px rgba(24,37,58,.04)}',
    '#' + PANEL_ID + ' .sy-item-top{display:flex;align-items:center;justify-content:space-between;gap:8px}',
    '#' + PANEL_ID + ' .sy-iname{font-size:16px;font-weight:700;color:#1f2733}',
    '#' + PANEL_ID + ' .sy-chip{flex:0 0 auto;font-size:11.5px;color:#4b8f5f;background:#eef8f1;border-radius:4px;padding:2px 7px}',
    '#' + PANEL_ID + ' .sy-addr{font-size:12.5px;color:#8a929e}',
    '#' + PANEL_ID + ' .sy-tags{display:flex;flex-wrap:wrap;gap:6px}',
    '#' + PANEL_ID + ' .sy-tag{font-size:11.5px;color:#e0432f;background:#fff2f0;border:1px solid #ffdcd6;border-radius:4px;padding:1px 7px}',
    '#' + PANEL_ID + ' .sy-meta{font-size:12.5px;color:#8a929e}',
    '#' + PANEL_ID + ' .sy-list{display:flex;flex-direction:column;gap:12px}',
    '#' + PANEL_ID + ' .sy-empty{font-size:13px;color:#98a1ad;padding:22px 0;text-align:center}',
    '@media(max-width:420px){#' + PANEL_ID + ' .sy-grid{gap:8px}',
    '#' + PANEL_ID + ' .sy-card{min-height:66px;padding:9px 10px 8px}',
    '#' + PANEL_ID + ' .sy-name{font-size:12.5px}#' + PANEL_ID + ' .sy-num{font-size:17px}',
    '#' + PANEL_ID + ' .sy-iname{font-size:15px}}'
  ].join('\n');

  /* ---------- 状态 ---------- */
  var rowEl = null;
  var panelEl = null;
  var curType = null;   /* 当前一级页签：小区/园楼/集团/家庭 */
  var subTab = 'overview'; /* overview | yd */
  var activeCard = -1;
  var hiddenNodes = [];

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  /* 只判断「有没有被渲染」，不能用视口位置：页面往下滚后一级页签会滚出视口，
     若据此判空会触发 cleanup，把子页签重置回「总览」并让滚动位置被夹回顶部。 */
  function isRendered(el) {
    if (!el.getClientRects().length) return false;
    return el.getBoundingClientRect().width > 40;
  }

  var rowNode = null;   /* 缓存一级页签行，避免滚动/重渲染时认错 */

  function topTabGroups() {
    var btns = document.querySelectorAll('#root button');
    var groups = [];
    for (var i = 0; i < btns.length; i += 1) {
      var t = (btns[i].textContent || '').trim();
      if (TOP_TABS.indexOf(t) < 0) continue;
      if (!isRendered(btns[i])) continue;
      var p = btns[i].parentNode;
      if (!p) continue;
      var g = null;
      for (var k = 0; k < groups.length; k += 1) {
        if (groups[k].row === p) { g = groups[k]; break; }
      }
      if (!g) { g = { row: p, btns: [] }; groups.push(g); }
      g.btns.push(btns[i]);
    }
    groups = groups.filter(function (x) { return x.btns.length >= 4; });
    groups.sort(function (a, b) {
      var sa = (a.row === rowNode ? 1000 : 0) + a.btns.length * 10 + a.row.getBoundingClientRect().width;
      var sb = (b.row === rowNode ? 1000 : 0) + b.btns.length * 10 + b.row.getBoundingClientRect().width;
      return sb - sa;
    });
    return groups;
  }

  function activeTopTab(btns) {
    for (var i = 0; i < btns.length; i += 1) {
      var inner = btns[i].querySelector('div') || btns[i];
      var m = (getComputedStyle(inner).color || '').match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (m && +m[3] > +m[1] + 40 && +m[3] > 120) return (btns[i].textContent || '').trim();
    }
    return null;
  }

  /* ---------- 子页签 ---------- */
  function buildRow(label) {
    var d = document.createElement('div');
    d.id = ROW_ID;
    d.setAttribute('data-sy-mine', '1');
    d.innerHTML = '<div class="sy-tab" data-sub="overview">总览</div>' +
      '<div class="sy-tab" data-sub="yd">' + label + '异动</div>';
    d.addEventListener('click', function (e) {
      var t = e.target.closest ? e.target.closest('.sy-tab') : null;
      if (!t) return;
      var sub = t.getAttribute('data-sub');
      if (sub === subTab) return;
      subTab = sub;
      activeCard = -1;
      paintRow();
      renderPanel();
    }, true);
    return d;
  }

  function paintRow() {
    if (!rowEl) return;
    var tabs = rowEl.querySelectorAll('.sy-tab');
    for (var i = 0; i < tabs.length; i += 1) {
      var on = tabs[i].getAttribute('data-sub') === subTab;
      tabs[i].className = 'sy-tab' + (on ? ' on' : '');
    }
  }

  function ensureRow(headerBlock, afterRow, label) {
    injectStyle();
    if (!rowEl || !rowEl.parentNode) {
      rowEl = buildRow(label);
      if (afterRow && afterRow.parentNode === headerBlock) {
        afterRow.parentNode.insertBefore(rowEl, afterRow.nextSibling);
      } else {
        headerBlock.appendChild(rowEl);
      }
    } else {
      var ydTab = rowEl.querySelector('.sy-tab[data-sub="yd"]');
      var want = label + '异动';
      if (ydTab && ydTab.textContent !== want) ydTab.textContent = want;
      if (rowEl.parentNode !== headerBlock) headerBlock.appendChild(rowEl);
    }
    paintRow();
  }

  /* ---------- 异动面板 ---------- */
  function cardHTML(m, i) {
    return '<div class="sy-card" data-card="' + i + '">' +
      '<div class="sy-top"><span class="sy-name">' + m + '</span>' + WARN + '</div>' +
      '<div class="sy-bottom"><span class="sy-num">800</span>' +
      '<span class="sy-yday">昨日<b>600</b></span></div></div>';
  }

  function itemHTML(it) {
    var tags = it.cats.map(function (c) {
      return '<span class="sy-tag">' + TAGS[c] + ' ' + TAG_UNIT[c] + '</span>';
    }).join('');
    return '<div class="sy-item" data-cats="' + it.cats.join(',') + '">' +
      '<div class="sy-item-top"><span class="sy-iname">' + it.name + '</span>' +
      '<span class="sy-chip">' + it.chip + '</span></div>' +
      '<div class="sy-addr">' + it.addr + '</div>' +
      '<div class="sy-tags">' + tags + '</div>' +
      '<div class="sy-meta">' + it.meta + '</div></div>';
  }

  function buildPanel(type) {
    var d = DATA[type];
    var p = document.createElement('div');
    p.id = PANEL_ID;
    p.setAttribute('data-sy-mine', '1');
    p.setAttribute('data-type', type);
    p.innerHTML =
      '<div class="sy-head"><div class="sy-left"><i class="sy-bar"></i><span class="sy-title">看异动</span></div>' +
      '<div class="sy-links"><span class="lnk">指标说明</span><span class="sep">｜</span><span class="lnk">查看更多 ›</span></div></div>' +
      '<div class="sy-grid">' + METRICS.map(cardHTML).join('') + '</div>' +
      '<div class="sy-head sy-sec"><div class="sy-left"><i class="sy-bar"></i><span class="sy-title">' + d.listTitle + '</span></div>' +
      '<div class="sy-links"><span class="lnk">编辑表头</span></div></div>' +
      '<div class="sy-searchlabel">' + d.searchLabel + '</div>' +
      '<div class="sy-search"><div class="sy-input"><input placeholder="' + d.placeholder + '"></div>' +
      '<div class="sy-filter">' + FUNNEL + '筛选</div></div>' +
      '<div class="sy-count"></div>' +
      '<div class="sy-list">' + d.items.map(itemHTML).join('') + '</div>';

    p.addEventListener('click', function (e) {
      var card = e.target.closest ? e.target.closest('.sy-card') : null;
      if (!card) return;
      var k = +card.getAttribute('data-card');
      activeCard = (activeCard === k) ? -1 : k;
      applyFilter();
    }, true);

    return p;
  }

  function applyFilter() {
    if (!panelEl) return;
    var cards = panelEl.querySelectorAll('.sy-card');
    for (var i = 0; i < cards.length; i += 1) {
      cards[i].className = 'sy-card' + (+cards[i].getAttribute('data-card') === activeCard ? ' on' : '');
    }
    var items = panelEl.querySelectorAll('.sy-item');
    var shown = 0;
    for (var j = 0; j < items.length; j += 1) {
      var cats = (items[j].getAttribute('data-cats') || '').split(',');
      var hit = activeCard < 0 || cats.indexOf(String(activeCard)) >= 0;
      items[j].style.display = hit ? '' : 'none';
      if (hit) shown += 1;
    }
    var d = DATA[panelEl.getAttribute('data-type')];
    var countEl = panelEl.querySelector('.sy-count');
    var emptyEl = panelEl.querySelector('.sy-empty');
    if (countEl) {
      countEl.textContent = activeCard < 0
        ? ('全部' + d.label + '异动 · ' + d.items.length + ' ' + d.unit + ' · 本人责任范围')
        : (METRICS[activeCard] + ' · ' + shown + ' ' + d.unit + ' · 本人责任范围');
    }
    var listEl = panelEl.querySelector('.sy-list');
    if (listEl) {
      if (shown === 0 && !emptyEl) {
        var e = document.createElement('div');
        e.className = 'sy-empty';
        e.textContent = '当前筛选下暂无' + d.label + '对象';
        listEl.parentNode.insertBefore(e, listEl.nextSibling);
      } else if (shown > 0 && emptyEl) {
        emptyEl.parentNode.removeChild(emptyEl);
      }
    }
  }

  /* ---------- 显隐原生内容 ---------- */
  function scrollParentOf(n) {
    var p = n.parentNode;
    while (p && p !== document.body) {
      var ov = getComputedStyle(p).overflowY;
      if (ov === 'auto' || ov === 'scroll' || ov === 'overlay') return p;
      p = p.parentNode;
    }
    return null;
  }

  function hideNative(headerBlock) {
    if (!rowEl) return;
    hiddenNodes = [];
    var seen = [];
    function kill(n) {
      if (!n || !n.getAttribute) return;
      if (n.getAttribute('data-sy-mine')) return;
      if (seen.indexOf(n) >= 0) return;
      seen.push(n);
      n.setAttribute('data-sy-hidden', '1');
      n.style.display = 'none';
      hiddenNodes.push(n);
    }
    /* 1) 标题块内部：子页签行之后的内容（统计卡、快捷查询、列表标题等） */
    var kids = [].slice.call(headerBlock.children);
    var after = false;
    for (var i = 0; i < kids.length; i += 1) {
      var n = kids[i];
      if (n === rowEl) { after = true; continue; }
      if (!after) continue;
      kill(n);
    }
    /* 2) 逐级向上直到滚动容器：每一层里「链节点之后」的兄弟都要隐藏
       （RN 重渲染后条目卡可能被挂到更外层，只扫一层会漏掉） */
    var scroller = scrollParentOf(headerBlock);
    var chainNode = headerBlock;
    var guard = 0;
    while (chainNode.parentNode && chainNode.parentNode !== scroller && guard < 6) {
      guard += 1;
      var parent = chainNode.parentNode;
      var sibs = [].slice.call(parent.children);
      var passed = false;
      for (var j = 0; j < sibs.length; j += 1) {
        var m = sibs[j];
        if (m === chainNode) { passed = true; continue; }
        if (!passed) continue;
        if (getComputedStyle(m).position === 'fixed') continue;   /* 底部导航等固定层不动 */
        var mt = m.textContent || '';
        if (mt.indexOf('工作台') >= 0 && mt.indexOf('营销作战') >= 0) continue;
        kill(m);
      }
      chainNode = parent;
    }
  }

  function showNative() {
    for (var i = 0; i < hiddenNodes.length; i += 1) {
      var n = hiddenNodes[i];
      if (n && n.parentNode && n.getAttribute('data-sy-hidden') === '1') {
        n.style.display = '';
        n.removeAttribute('data-sy-hidden');
      }
    }
    hiddenNodes = [];
  }

  function removePanel() {
    if (panelEl && panelEl.parentNode) panelEl.parentNode.removeChild(panelEl);
    panelEl = null;
  }

  function cleanup() {
    showNative();
    removePanel();
    if (rowEl && rowEl.parentNode) rowEl.parentNode.removeChild(rowEl);
    rowEl = null;
    curType = null;
    subTab = 'overview';
    activeCard = -1;
  }

  function renderPanel() {
    if (!rowEl) return;
    var headerBlock = rowEl.parentNode;
    if (!headerBlock) return;
    if (subTab !== 'yd') {
      removePanel();
      showNative();
      return;
    }
    if (panelEl && panelEl.parentNode && panelEl.getAttribute('data-type') === curType) {
      hideNative(headerBlock);
      return;
    }
    removePanel();
    panelEl = buildPanel(curType);
    headerBlock.parentNode.insertBefore(panelEl, headerBlock.nextSibling);
    hideNative(headerBlock);
    applyFilter();
  }

  var missCount = 0;

  function tick() {
    var groups = topTabGroups();
    if (!groups.length) {
      /* 可能是页面切换/重渲染的瞬时状态：连续多次找不到才真正清理 */
      missCount += 1;
      if (missCount >= 6) { cleanup(); rowNode = null; missCount = 0; }
      return;
    }
    missCount = 0;

    var g = groups[0];
    rowNode = g.row;
    var type = activeTopTab(g.btns) || curType;   /* 取不到高亮时沿用上一次，避免误判为切走 */
    if (!type) return;
    if (!DATA[type]) {                            /* 「个人」页由别的脚本负责，这里清理干净 */
      cleanup();
      rowNode = g.row;
      return;
    }

    var row = g.row;                       /* 一级页签行 */
    var wrap = row.parentNode;             /* overflow hidden 包装 */
    var headerBlock = wrap ? wrap.parentNode : null;  /* 标题 + 页签 区块 */
    if (!headerBlock) return;

    if (curType && curType !== type) {
      /* 切到另一个一级页签：回到总览 */
      subTab = 'overview';
      activeCard = -1;
      removePanel();
      showNative();
    }
    curType = type;
    ensureRow(headerBlock, wrap, type);
    renderPanel();
  }

  var timer = null;
  function start() {
    if (timer) return;
    timer = setInterval(function () {
      try { tick(); } catch (e) { /* 容错，等待下一次 */ }
    }, 320);
    try { tick(); } catch (e) {}
  }

  if (document.readyState === 'complete' || document.readyState === 'interactive') start();
  else document.addEventListener('DOMContentLoaded', start);
  window.addEventListener('load', start);
  window.__subYdHook = 'v2';
})();
