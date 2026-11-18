(function () {
  var layer = document.getElementById('leaderReportLayer');
  var frame = document.getElementById('leaderReportFrame');
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

  /* 预热：角色匹配时先把报告页加载好（隐藏），点开只做 display:block，
     避免「先看到旧日报页、再跳到新版」的闪屏 */
  function preload() {
    if (currentRole() !== '网格长') return;
    if (frame.getAttribute('data-loaded') === '1') return;
    frame.setAttribute('data-loaded', '1');
    frame.src = './leader-report.html?v=2';
  }

  function openLeaderReport() {
    if (opened) return;
    if (currentRole() !== '网格长') return;
    opened = true;
    preload();
    layer.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeLeaderReport() {
    if (!opened) return;
    opened = false;
    layer.style.display = 'none';
    document.body.style.overflow = '';
    try { window.dispatchEvent(new CustomEvent('wgt:report-closed', { detail: { who: 'leader' } })); } catch (e) {}
  }

  function clickButton(label) {
    var candidates = Array.prototype.slice.call(document.querySelectorAll('[role="button"],button'));
    var target = candidates.find(function (node) {
      return (node.innerText || '').trim() === label || node.getAttribute('aria-label') === label;
    });
    if (target) target.click();
  }

  window.addEventListener('message', function (event) {
    if (!event || !event.data) return;
    if (event.data.type === 'closeLeaderReport') {
      closeLeaderReport();
      if (event.data.back) setTimeout(function () { clickButton('返回'); }, 20);
    }
    if (event.data.type === 'wgtReportStats') { try { window.__wgtCardPaint && window.__wgtCardPaint(); } catch (e) {} }
  });

  document.addEventListener('click', function (event) {
    if (currentRole() !== '网格长') return;
    if (opened) return;
    var node = event.target;
    for (var i = 0; i < 5 && node; i += 1, node = node.parentElement) {
      var text = (node.innerText || '').trim();
      /* 卡片切到周报/月报时入口文案会变成「AI 周报 / AI 月报」，都要能命中 */
      if (/AI\s*[日周月]报/.test(text) && text.length < 40) {
        openLeaderReport();
        return;
      }
    }
  }, true);

  preload();
  setInterval(function () {
    preload();
    if (currentRole() !== '网格长' && opened) closeLeaderReport();
  }, 800);

  if (location.hash === '#leader-report') setTimeout(openLeaderReport, 300);
  window.__openLeaderReport = openLeaderReport;
})();
