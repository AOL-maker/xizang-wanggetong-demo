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

  function openManagerReport() {
    if (opened || currentRole() !== '网格经理') return;
    opened = true;
    frame.src = './manager-report.html';
    layer.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeManagerReport() {
    if (!opened) return;
    opened = false;
    layer.style.display = 'none';
    frame.src = 'about:blank';
    document.body.style.overflow = '';
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
  });

  document.addEventListener('click', function (event) {
    if (currentRole() !== '网格经理') return;
    var node = event.target;
    for (var i = 0; i < 5 && node; i += 1, node = node.parentElement) {
      var text = (node.innerText || '').trim();
      if ((text.indexOf('AI日报') >= 0 || text.indexOf('AI 日报') >= 0) && text.length < 40) {
        setTimeout(openManagerReport, 120);
        return;
      }
    }
  }, true);

  if (location.hash === '#manager-report') setTimeout(openManagerReport, 300);
  window.__openManagerReport = openManagerReport;
})();
