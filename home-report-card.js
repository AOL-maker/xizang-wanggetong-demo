/* 工作台「AI 日报 / 周报 / 月报」卡片 · 三宫格数据联动
   ------------------------------------------------------------------
   原生卡片里的「今日有效完成 / 今日计划进度 / 历史待跟进」是写死在 bundle 里的假数，
   与新做的报告页（manager-report.html / leader-report.html）对不上。
   这里从已预热的报告页 iframe 读取 window.__WGT_CARD_STATS（三周期各一组），
   按卡片当前选中的 日报/周报/月报 覆盖数字与文案，保证「外面看到的 = 里面报告的」。 */
(function () {
  var MAP = { '网格经理': 'managerReportFrame', '网格长': 'leaderReportFrame' };
  var PERIOD = { '日报': 'day', '周报': 'week', '月报': 'month' };

  function currentRole() {
    try {
      var stored = JSON.parse(localStorage.getItem('wanggetong-preferences-v1') || '{}');
      return stored && stored.state && stored.state.role;
    } catch (_) {
      return '';
    }
  }

  function statsOf(role) {
    var id = MAP[role];
    if (!id) return null;
    var f = document.getElementById(id);
    if (!f || !f.contentWindow) return null;
    try {
      var s = f.contentWindow.__WGT_CARD_STATS;
      return (s && s.day && s.week && s.month) ? s : null;
    } catch (e) {
      return null;
    }
  }

  function isAccent(el) {
    var m = (getComputedStyle(el).color || '').match(/(\d+),\s*(\d+),\s*(\d+)/);
    return !!m && +m[3] > +m[1] + 40 && +m[3] > 120;
  }

  /* 卡片内当前选中的周期（高亮的是蓝字） */
  function activePeriod(mod) {
    var btns = mod.querySelectorAll('button');
    for (var i = 0; i < btns.length; i += 1) {
      var t = (btns[i].textContent || '').trim();
      if (!PERIOD[t]) continue;
      var inner = btns[i].querySelector('div') || btns[i];
      if (isAccent(inner)) return PERIOD[t];
    }
    return 'day';
  }

  function statButtons(mod) {
    var out = [];
    var btns = mod.querySelectorAll('button[aria-label]');
    for (var i = 0; i < btns.length; i += 1) {
      if (/^简报/.test(btns[i].getAttribute('aria-label') || '')) out.push(btns[i]);
    }
    return out;
  }

  function paint() {
    var role = currentRole();
    var stats = statsOf(role);
    if (!stats) return 0;
    var mods = document.querySelectorAll('[data-testid="home-module-reports"]');
    var written = 0;
    for (var m = 0; m < mods.length; m += 1) {
      var mod = mods[m];
      if (!mod.getClientRects().length) continue;   /* RN 会保留多份隐藏副本 */
      var arr = stats[activePeriod(mod)] || [];
      var btns = statButtons(mod);
      for (var i = 0; i < btns.length && i < arr.length; i += 1) {
        var ds = btns[i].querySelectorAll('div');
        if (ds.length < 2) continue;
        var it = arr[i];
        if ((ds[0].textContent || '').trim() !== it.v) { ds[0].textContent = it.v; written += 1; }
        if ((ds[1].textContent || '').trim() !== it.l) { ds[1].textContent = it.l; written += 1; }
        var aria = '简报' + it.l + ' ' + it.v;
        if (btns[i].getAttribute('aria-label') !== aria) btns[i].setAttribute('aria-label', aria);
      }
    }
    return written;
  }

  var timer = null;
  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; try { paint(); } catch (e) {} }, 120);
  }

  try {
    new MutationObserver(schedule).observe(document.documentElement, { childList: true, subtree: true, characterData: true });
  } catch (e) {}
  document.addEventListener('click', schedule, true);       /* 切 日报/周报/月报 */
  window.addEventListener('wgt:report-closed', schedule);   /* 关掉报告浮层后按最新数据刷一次 */
  window.addEventListener('wgt:grid-change', schedule);
  setInterval(function () { try { paint(); } catch (e) {} }, 1500);
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', schedule);
  else schedule();

  window.__wgtCardPaint = paint;
  window.__wgtCardDebug = function () {
    var role = currentRole();
    var stats = statsOf(role);
    var mods = document.querySelectorAll('[data-testid="home-module-reports"]');
    var out = [];
    for (var i = 0; i < mods.length; i += 1) {
      if (!mods[i].getClientRects().length) continue;
      out.push({
        period: activePeriod(mods[i]),
        stats: statButtons(mods[i]).map(function (b) { return b.innerText.replace(/\n/g, ' '); })
      });
    }
    return { role: role, hasStats: !!stats, all: stats, rendered: out };
  };
})();
