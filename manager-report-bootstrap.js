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

  /* 预热：角色匹配时就把报告页加载好（隐藏），点开时只需 display:block，
     避免「先看到原生旧日报页、再跳到新版」的闪屏 */
  function preload() {
    if (currentRole() !== '网格经理') return;
    if (frame.getAttribute('data-loaded') === '1') return;
    frame.setAttribute('data-loaded', '1');
    frame.src = './manager-report.html?v=2';
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

  /* 角色可能稍后才写入 localStorage（登录/切换角色）→ 每秒补一次预热 */
  preload();
  setInterval(function () {
    preload();
    if (currentRole() !== '网格经理' && opened) closeManagerReport();
  }, 800);

  if (location.hash === '#manager-report') setTimeout(openManagerReport, 300);
  window.__openManagerReport = openManagerReport;
})();
