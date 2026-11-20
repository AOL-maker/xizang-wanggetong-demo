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

  /* 预热：页面一加载就把报告页加载好（隐藏），不等角色确定。
     登录前 localStorage 里还没有角色；若等角色出现再加载，工作台卡片会先显示几秒
     写死的假数。报告页是纯静态、不依赖角色，无条件预热是安全的。 */
  function preload() {
    if (frame.getAttribute('data-loaded') === '1') return;
    frame.setAttribute('data-loaded', '1');
    frame.src = './leader-report.html?v=4';
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

  /* 触屏/按下即开层：比 click 更早，避免原生跳转先画一帧旧页 */
  ['pointerdown', 'touchstart'].forEach(function (evt) {
    document.addEventListener(evt, function (event) {
      if (currentRole() !== '网格长' || opened) return;
      var node = event.target;
      for (var i = 0; i < 4 && node; i += 1, node = node.parentElement) {
        var t = (node.innerText || '').trim();
        /* 必须限定短文本：否则向上遍历到 body 时整页文本也含这句，
           会在筛选面板等任何弹层里按下鼠标就误开报告浮层 */
        if (t.length < 40 && /查看 AI\s*[日周月]报与工作建议/.test(t)) { openLeaderReport(); return; }
      }
    }, true);
  });

  preload();
  setInterval(function () {
    preload();
    if (currentRole() !== '网格长' && opened) closeLeaderReport();
  }, 800);

  if (location.hash === '#leader-report') setTimeout(openLeaderReport, 300);
  window.__openLeaderReport = openLeaderReport;
})();
