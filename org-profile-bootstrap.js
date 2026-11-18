/* 小区 / 园楼 / 集团 / 家庭 · 画像浮层
   - 点总览名单里的对象卡片（「查看成员、标签与关联信息 →」）或异动面板里的对象 → 打开画像
   - 画像内容：基础信息 + 成员信息（组织下成员名单）+ 本组织服务
   - 画像内点成员 → 继续下钻到「个人客户画像」 */
(function () {
  var LAYER_ID = 'orgProfileLayer';
  var FRAME_ID = 'orgProfileFrame';
  var TOP_TABS = ['个人', '小区', '园楼', '集团', '家庭'];
  var TYPE_KEY = { '小区': 'xq', '园楼': 'yl', '集团': 'grp', '家庭': 'ji' };
  var opened = false, layer = null, frame = null;

  function KAN() { return window.WGT_KAN || null; }

  function ensureLayer() {
    layer = document.getElementById(LAYER_ID);
    if (layer) { frame = document.getElementById(FRAME_ID) || layer.querySelector('iframe'); return; }
    layer = document.createElement('div');
    layer.id = LAYER_ID;
    layer.style.cssText = 'position:fixed;inset:0;z-index:2147482600;background:#fff;display:none;';
    frame = document.createElement('iframe');
    frame.id = FRAME_ID;
    frame.title = '组织画像';
    frame.style.cssText = 'border:0;width:100%;height:100%;display:block;background:#f5f7fa;';
    frame.src = 'about:blank';
    layer.appendChild(frame);
    document.body.appendChild(layer);
  }

  function loadFrame() {
    if (!frame) ensureLayer();
    if (!frame.src || frame.src.indexOf('org-profile.html') < 0) frame.src = './org-profile.html?v=1';
  }

  function openOrg(type, name) {
    var k = KAN();
    if (!k) return;
    ensureLayer();
    var detail = k.orgDetail(type, name);
    if (!detail) return;
    loadFrame();
    opened = true;
    layer.style.display = 'block';
    document.body.style.overflow = 'hidden';
    var push = function () {
      try {
        var w = frame.contentWindow;
        if (w && typeof w.__setOrg === 'function') w.__setOrg(detail);
      } catch (e) {}
    };
    push();
    /* 首次加载时 __setOrg 还没就绪，等 load 再推一次 */
    frame.addEventListener('load', push);
    setTimeout(push, 120);
    setTimeout(push, 400);
  }

  function closeOrg() {
    if (!layer) return;
    opened = false;
    layer.style.display = 'none';
    document.body.style.overflow = '';
    if (frame) frame.src = 'about:blank';
    setTimeout(function () {
      if (!opened) loadFrame();
    }, 500);
  }

  /* ---------- 判断当前一级页签 ---------- */
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

  function isOrgRowText(t) {
    if (!t) return false;
    if (t.indexOf('查看成员、标签与关联信息') >= 0) return true;
    if (t.indexOf('查看家庭成员与关联信息') >= 0) return true;
    return false;
  }

  function resolveName(type, rowText) {
    var k = KAN();
    if (!k) return '';
    var list = k.orgs(type);
    for (var i = 0; i < list.length; i += 1) {
      if (rowText.indexOf(list[i].name) >= 0) return list[i].name;
    }
    return '';   /* 认不出是本页对象就不拦截，交给原生页面 */
  }

  /* 拦截原生对象卡片：先开画像，再挡住原生「小区客户详情」页 */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    if (t.closest('#' + LAYER_ID)) return;
    if (t.closest('#subYdPanel')) return;          /* 异动面板自己处理 */
    if (t.closest('#krObjList')) return;           /* 自建名单自己处理 */
    var topBtn = t.closest('button');
    if (topBtn && TOP_TABS.indexOf((topBtn.textContent || '').trim()) >= 0) return;  /* 别拦一级页签 */

    var type = activeTopType();
    if (!type || !TYPE_KEY[type]) return;          /* 个人页交给 customer-profile */

    /* 取「最内层」命中：对象卡片内部层层都含同一句提示，必须停在第一层 */
    var node = t;
    var hit = null;
    for (var i = 0; i < 9 && node && node !== document.body; i += 1, node = node.parentElement) {
      var txt = node.innerText || '';
      if (txt.length > 460) break;
      if (isOrgRowText(txt) && txt.length >= 24 && txt.length <= 320) { hit = node; break; }
    }
    if (!hit) return;

    var rowText = hit.innerText || '';
    if (!/看管人|家庭联系人|集团编码|关联客户|成员客户/.test(rowText)) return;
    var name = resolveName(TYPE_KEY[type], rowText);
    if (!name) return;
    e.stopPropagation();
    e.preventDefault();
    openOrg(TYPE_KEY[type], name);
  }, true);

  window.addEventListener('message', function (e) {
    if (!e || !e.data) return;
    if (e.data.type === 'closeOrgProfile') { closeOrg(); return; }
    if (e.data.type === 'openMemberProfile') {
      var nm = e.data.name, ph = e.data.phone;
      closeOrg();
      setTimeout(function () {
        if (typeof window.__openMemberProfile === 'function') window.__openMemberProfile(nm, ph);
      }, 60);
    }
  });

  window.__openOrgProfile = openOrg;
  window.__closeOrgProfile = closeOrg;
  /* 预加载，点开零等待 */
  setTimeout(function () { ensureLayer(); loadFrame(); }, 1600);
  var timer = setInterval(function () { void timer; }, 1000);
  clearInterval(timer);
  window.__orgProfileHook = 'v1';
})();
