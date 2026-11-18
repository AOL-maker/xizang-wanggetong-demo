(function () {
  var layer = document.getElementById('managerReportLayer');
  var frame = document.getElementById('managerReportFrame');
  var opened = false;
  if (!layer || !frame) return;

  function currentRole() {
    try {
      var stored = JSON.parse(localStorage.getItem('wanggetong-preferences-v1') || '{}');
      return stored && stored.state && stored.state.role;
    } catch (_) {
      return '';
    }
  }

  /* 预热：页面一加载就把报告页加载好（隐藏），不等角色确定。
     登录前 localStorage 里还没有角色；若等角色出现再加载，工作台卡片会先显示几秒
     写死的 1 / 20% / 0。报告页是纯静态、不依赖角色，无条件预热是安全的。 */
  function preload() {
    if (frame.getAttribute('data-loaded') === '1') return;
    frame.setAttribute('data-loaded', '1');
    frame.src = './manager-report.html?v=6';
  }

  function openManagerReport() {
    if (opened) return;
    if (currentRole() !== '网格经理') return;
    opened = true;
    preload();
    layer.style.display = 'block';
    document.body.style.overflow = 'hidden';
    window.__managerReportOpenedAt = Date.now();
  }

  function closeManagerReport() {
    if (!opened) return;
    opened = false;
    layer.style.display = 'none';
    document.body.style.overflow = '';
    /* 不重置 iframe：保持热态，第二次打开零加载、无闪屏 */
    try { window.dispatchEvent(new CustomEvent('wgt:report-closed', { detail: { who: 'manager' } })); } catch (e) {}
  }

  function clickButton(label) {
    var candidates = Array.prototype.slice.call(document.querySelectorAll('[role="button"],button'));
    var target = candidates.filter(function (node) {
      return (node.innerText || '').trim() === label || node.getAttribute('aria-label') === label;
    })[0];
    if (target) target.click();
  }

  window.addEventListener('message', function (event) {
    if (!event || !event.data) return;
    if (event.data.type === 'closeManagerReport') {
      closeManagerReport();
      if (event.data.back) setTimeout(function () { clickButton('返回'); }, 20);
    }
    if (event.data.type === 'wgtReportStats') { try { window.__wgtCardPaint && window.__wgtCardPaint(); } catch (e) {} }
  });

  /* capture 阶段同步打开：赶在 React 的原生跳转之前把浮层盖上去 */
  document.addEventListener('click', function (event) {
    if (currentRole() !== '网格经理') return;
    if (opened) return;
    var node = event.target;
    for (var i = 0; i < 5 && node; i += 1, node = node.parentElement) {
      var text = (node.innerText || '').trim();
      /* 卡片切到周报/月报时入口文案会变成「AI 周报 / AI 月报」，都要能命中 */
      if (/AI\s*[日周月]报/.test(text) && text.length < 40) {
        openManagerReport();
        return;
      }
    }
  }, true);

  /* 触屏/按下即开层：比 click 更早，避免原生跳转先画一帧旧页 */
  ['pointerdown', 'touchstart'].forEach(function (evt) {
    document.addEventListener(evt, function (event) {
      if (currentRole() !== '网格经理' || opened) return;
      var node = event.target;
      for (var i = 0; i < 4 && node; i += 1, node = node.parentElement) {
        var t = (node.innerText || '').trim();
        /* 必须限定短文本：否则向上遍历到 body 时整页文本也含这句，
           会在筛选面板等任何弹层里按下鼠标就误开报告浮层 */
        if (t.length < 40 && /查看 AI\s*[日周月]报与工作建议/.test(t)) { openManagerReport(); return; }
      }
    }, true);
  });

  /* 角色可能稍后才写入 localStorage（登录/切换角色）→ 每秒补一次预热 */
  preload();
  setInterval(function () {
    preload();
    if (currentRole() !== '网格经理' && opened) closeManagerReport();
  }, 800);

  if (location.hash === '#manager-report') setTimeout(openManagerReport, 300);
  window.__openManagerReport = openManagerReport;
})();
