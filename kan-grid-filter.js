/* 客户看管 · 网格筛选（网格长可查看片区下其他网格的数据）
   交互：点顶部面包屑「昌都市-芒康县-芒康县片区-如美网格」→ 底部弹出「区域筛选」四列浮层
        → 选网格 → 确定 → 面包屑与统计/异动/画像数据同步刷新。
   仅「网格长」可切换网格；其他角色打开浮层看到说明（演示口径）。 */
(function () {
  var STYLE_ID = 'wgtGridStyle';
  var LAYER_ID = 'wgtGridLayer';
  var CRUMB_RE = /^[\u4e00-\u9fa5]{2,4}市-[\u4e00-\u9fa5]{2,6}县-.+-.+网格$/;

  var CITIES = ['林芝市', '日喀则市', '昌都市', '阿里地区', '山南市', '拉萨市', '那曲地区'];
  var COUNTIES = ['芒康县', '江达县', '贡觉县', '类乌齐县', '丁青县', '察雅县', '八宿县'];
  var AREAS = ['芒康县片区', '盐井片区'];
  var GRID_ORDER = ['mangkang', 'yankuang', 'rumi'];

  var CSS = [
    '#' + LAYER_ID + '{position:fixed;inset:0;z-index:2147482000;pointer-events:none}',
    '#' + LAYER_ID + '.on{pointer-events:auto}',
    '#' + LAYER_ID + ' .gf-mask{position:absolute;inset:0;background:rgba(17,24,39,.45);opacity:0;transition:opacity .24s ease}',
    '#' + LAYER_ID + '.on .gf-mask{opacity:1}',
    '#' + LAYER_ID + ' .gf-sheet{position:absolute;left:50%;bottom:0;width:100%;max-width:600px;transform:translate(-50%,101%);',
    '  transition:transform .28s cubic-bezier(.22,.61,.36,1);',
    '  background:#fff;border-radius:16px 16px 0 0;box-sizing:border-box;padding:0 0 14px;max-height:76vh;display:flex;flex-direction:column;',
    '  box-shadow:0 -8px 28px rgba(17,24,39,.16)}',
    '#' + LAYER_ID + '.on .gf-sheet{transform:translate(-50%,0)}',
    '#' + LAYER_ID + ' .gf-head{position:relative;height:52px;display:grid;place-items:center;flex:0 0 auto}',
    '#' + LAYER_ID + ' .gf-title{font-size:17px;font-weight:700;color:#1d2430}',
    '#' + LAYER_ID + ' .gf-close{position:absolute;right:6px;top:6px;width:40px;height:40px;display:grid;place-items:center;',
    '  font-size:22px;color:#4a5563;cursor:pointer;line-height:1}',
    '#' + LAYER_ID + ' .gf-note{margin:0 18px 8px;font-size:11.5px;color:#8a939e;line-height:1.6}',
    '#' + LAYER_ID + ' .gf-cols{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;padding:0 10px;flex:1 1 auto;overflow:hidden}',
    '#' + LAYER_ID + ' .gf-col{display:flex;flex-direction:column;min-width:0}',
    '#' + LAYER_ID + ' .gf-col-t{font-size:13px;font-weight:600;color:#6b7480;padding:6px 0 10px;text-align:center}',
    '#' + LAYER_ID + ' .gf-col-t.on{color:#1361ff}',
    '#' + LAYER_ID + ' .gf-list{overflow-y:auto;overflow-x:hidden;flex:1 1 auto;max-height:46vh;padding-bottom:6px}',
    '#' + LAYER_ID + ' .gf-item{padding:11px 4px;font-size:14px;color:#2b3440;text-align:center;cursor:pointer;border-radius:8px;',
    '  white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '#' + LAYER_ID + ' .gf-item.cur{color:#1361ff;font-weight:600}',
    '#' + LAYER_ID + ' .gf-item.sel{color:#1361ff;font-weight:700;background:#eaf2ff}',
    '#' + LAYER_ID + ' .gf-item.lock{color:#c3c9d4;cursor:default}',
    '#' + LAYER_ID + ' .gf-foot{display:flex;gap:12px;padding:12px 16px 0;flex:0 0 auto}',
    '#' + LAYER_ID + ' .gf-btn{flex:1 1 0;height:44px;border-radius:10px;display:grid;place-items:center;font-size:15px;font-weight:600;cursor:pointer}',
    '#' + LAYER_ID + ' .gf-btn.ghost{background:#f2f4f7;color:#4a5563}',
    '#' + LAYER_ID + ' .gf-btn.main{background:#1361ff;color:#fff;box-shadow:0 4px 12px rgba(19,97,255,.28)}',
    '#' + LAYER_ID + ' .gf-btn.main.off{background:#c9d8f6;box-shadow:none;cursor:default}',
    /* 面包屑可点击态：末尾加一个小箭头，提示可切换 */
    '.gf-crumb{cursor:pointer}',
    '.gf-crumb:after{content:"›";display:inline-block;margin-left:4px;font-size:13px;color:#1361ff;transform:rotate(90deg);vertical-align:1px}',
    '#wgtGridToast{position:fixed;left:50%;bottom:74px;transform:translate(-50%,12px);background:rgba(25,31,40,.92);color:#fff;',
    '  font-size:13px;padding:10px 18px;border-radius:22px;opacity:0;pointer-events:none;transition:.2s;z-index:2147483001;max-width:80vw;text-align:center}',
    '#wgtGridToast.on{opacity:1;transform:translate(-50%,0)}'
  ].join('\n');

  var layer = null, toastEl = null, toastTimer = null;
  var pending = '';       /* 浮层里正在选的网格 */

  function KAN() { return window.WGT_KAN || null; }

  function injectStyle() {
    if (document.getElementById(STYLE_ID)) return;
    var s = document.createElement('style');
    s.id = STYLE_ID;
    s.textContent = CSS;
    document.head.appendChild(s);
  }

  function toast(msg) {
    if (!toastEl) {
      toastEl = document.createElement('div');
      toastEl.id = 'wgtGridToast';
      document.body.appendChild(toastEl);
    }
    toastEl.textContent = msg;
    toastEl.classList.add('on');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { toastEl.classList.remove('on'); }, 2000);
  }

  /* ---------- 面包屑 ---------- */
  function crumbs() {
    var out = [];
    var els = document.querySelectorAll('#root div, #root span');
    for (var i = 0; i < els.length; i += 1) {
      var el = els[i];
      if (el.children.length) continue;
      var t = (el.textContent || '').trim();
      if (t.length > 42 || !CRUMB_RE.test(t)) continue;
      out.push(el);
    }
    return out;
  }

  function paintCrumbs() {
    var k = KAN();
    if (!k) return;
    var want = k.breadcrumb();
    var list = crumbs();
    for (var i = 0; i < list.length; i += 1) {
      var el = list[i];
      if ((el.textContent || '').trim() !== want) el.textContent = want;
      if (!el.__gfBound) {
        el.__gfBound = 1;
        el.classList.add('gf-crumb');
      }
    }
  }

  /* ---------- 浮层 ---------- */
  function column(title, items, activeText, opts) {
    var isGrid = opts && opts.grid;
    var html = '<div class="gf-col"><div class="gf-col-t' + (isGrid ? ' on' : '') + '">' + title + '</div><div class="gf-list">';
    for (var i = 0; i < items.length; i += 1) {
      var label = items[i].label;
      var key = items[i].key || '';
      var cls = 'gf-item';
      if (label === activeText) cls += ' cur';
      if (isGrid && key === pending) cls += ' sel';
      if (isGrid && opts.locked) cls += ' lock';
      html += '<div class="' + cls + '"' + (isGrid ? ' data-grid="' + key + '"' : '') + '>' + label + '</div>';
    }
    return html + '</div></div>';
  }

  function buildLayer() {
    if (layer) return layer;
    var k = KAN();
    var grids = k ? k.grids() : [];
    var ordered = [];
    for (var i = 0; i < GRID_ORDER.length; i += 1) {
      for (var j = 0; j < grids.length; j += 1) if (grids[j].key === GRID_ORDER[i]) ordered.push({ label: grids[j].name, key: grids[j].key });
    }
    for (var m = 0; m < grids.length; m += 1) {
      var found = false;
      for (var n = 0; n < ordered.length; n += 1) if (ordered[n].key === grids[m].key) found = true;
      if (!found) ordered.push({ label: grids[m].name, key: grids[m].key });
    }

    var leader = k ? k.isLeader() : true;
    layer = document.createElement('div');
    layer.id = LAYER_ID;
    layer.innerHTML =
      '<div class="gf-mask" data-act="close"></div>' +
      '<div class="gf-sheet">' +
      '<div class="gf-head"><span class="gf-title">区域筛选</span><span class="gf-close" data-act="close">×</span></div>' +
      (leader ? '' : '<div class="gf-note">当前角色为网格经理，仅可查看本网格数据；网格长可切换查看片区下其他网格。</div>') +
      '<div class="gf-cols">' +
      column('地市', CITIES.map(function (c) { return { label: c }; }), '昌都市') +
      column('区县', COUNTIES.map(function (c) { return { label: c }; }), '芒康县') +
      column('片区', AREAS.map(function (c) { return { label: c }; }), '芒康县片区') +
      column('网格', ordered, k ? k.gridName() : '', { grid: true, locked: !leader }) +
      '</div>' +
      '<div class="gf-foot"><div class="gf-btn ghost" data-act="close">取消</div>' +
      '<div class="gf-btn main' + (k && pending === k.grid() ? ' off' : '') + '" data-act="ok">确定</div></div>' +
      '</div>';

    layer.addEventListener('click', function (e) {
      var act = e.target.getAttribute && e.target.getAttribute('data-act');
      if (act === 'close') { close(); return; }
      if (act === 'ok') { confirm(); return; }
      var gi = e.target.closest ? e.target.closest('.gf-item[data-grid]') : null;
      if (!gi) return;
      var kk = KAN();
      if (kk && !kk.isLeader()) { toast('网格经理仅可查看本网格数据（演示）'); return; }
      pending = gi.getAttribute('data-grid');
      refreshSelection();
    }, true);

    document.body.appendChild(layer);
    return layer;
  }

  function refreshSelection() {
    if (!layer) return;
    var items = layer.querySelectorAll('.gf-item[data-grid]');
    for (var i = 0; i < items.length; i += 1) {
      var on = items[i].getAttribute('data-grid') === pending;
      items[i].classList.toggle('sel', on);
    }
    var ok = layer.querySelector('.gf-btn.main');
    var k = KAN();
    if (ok && k) ok.classList.toggle('off', pending === k.grid());
  }

  function open() {
    injectStyle();
    var k = KAN();
    if (!k) return;
    pending = k.grid();
    buildLayer();
    refreshSelection();
    /* 先让它按「收起」状态渲染一帧，再加 on，才能看到上滑动画 */
    layer.classList.remove('on');
    void layer.offsetHeight;
    layer.classList.add('on');
  }

  function close() {
    if (layer) layer.classList.remove('on');
  }

  function confirm() {
    var k = KAN();
    if (!k) return;
    if (pending === k.grid()) { close(); return; }
    var name = '';
    var grids = k.grids();
    for (var i = 0; i < grids.length; i += 1) if (grids[i].key === pending) name = grids[i].name;
    k.setGrid(pending);
    close();
    paintCrumbs();
    toast('已切换至 ' + name + ' · 看管数据已同步更新');
  }

  /* ---------- 入口绑定 ---------- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#' + LAYER_ID)) return;
    var crumb = t.closest('.gf-crumb');
    if (!crumb) return;
    e.stopPropagation();
    e.preventDefault();
    open();
  }, true);

  /* 原生「个人」名单里的地址还写着「拉萨市…」，与面包屑的「昌都市-芒康县」矛盾；
     这里把文本节点前缀改成本网格所在镇，切网格时一并刷新。 */
  var lastAddrAt = 0;
  function rewriteAddresses() {
    var now = Date.now();
    if (now - lastAddrAt < 1200) return;
    lastAddrAt = now;
    var k = KAN();
    if (!k) return;
    var prefix = '昌都市芒康县' + k.gridTown();
    var root = document.getElementById('root');
    if (!root) return;
    var walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null, false);
    var node, hits = [];
    while ((node = walker.nextNode())) {
      var v = node.nodeValue || '';
      if (v.length > 60 || v.indexOf('拉萨市') < 0) continue;
      hits.push(node);
    }
    /* 街名也换成本地街名，避免出现「如美镇八廓街」这种明显串味的地址 */
    var STREET = { '八廓街': '澜沧江路', '吉日街道': '团结路', '江苏路': '318国道' };
    function fixStreet(t) {
      return t.replace(/八廓街|吉日街道|江苏路/g, function (m) { return STREET[m]; });
    }
    for (var i = 0; i < hits.length; i += 1) {
      var val = hits[i].nodeValue || '';
      var next = val.indexOf('拉萨市') === 0 ? prefix + val.slice(3) : val.replace(/拉萨市/g, prefix);
      hits[i].nodeValue = fixStreet(next);
    }
  }

  function tick() {
    injectStyle();
    paintCrumbs();
    rewriteAddresses();
  }

  var timer = setInterval(function () { try { tick(); } catch (e) {} }, 600);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  else tick();
  try { new MutationObserver(function () { try { tick(); } catch (e) {} }).observe(document.documentElement, { childList: true, subtree: true }); } catch (e) {}
  window.addEventListener('wgt:grid-change', function () { try { tick(); } catch (e) {} });
  window.__openGridFilter = open;
  window.__gridFilterHook = 'v2';
  void timer;
})();
