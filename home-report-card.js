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
      if (typeof s === 'function') s = s();          /* 报告页按当前数据实时重算 */
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

  /* 卡片副标题（原生 "2026-11-20 · 我的工作日报" / "昨日 2026-11-19 · 智能晨会简报"）
     —— 原生 bundle 用系统当天日期拼，必须按报告基准日覆盖，否则和报告页差一截。
     原生只在首次渲染时拼一次，切 日报/周报/月报 不会重算，所以覆盖过的节点要打标记，
     之后切周期才能继续改写（否则文本已不含 "·"，正则再也匹配不到）。 */
  var CAP_RE = /^(昨日 )?\d{4}-\d{2}-\d{2}( — \d{4}-\d{2}-\d{2})? ?·/;
  function paintCaption(mod, text) {
    if (!text) return 0;
    var els = mod.querySelectorAll('div,span,p');
    var n = 0;
    for (var i = 0; i < els.length; i += 1) {
      var el = els[i];
      if (el.children.length) continue;
      var t = (el.textContent || '').trim();
      var marked = el.getAttribute('data-wgt-cap') === '1';
      if (!marked && !CAP_RE.test(t)) continue;
      /* 节点被原生复用成别的文案时放弃标记，避免误改 */
      if (marked && !/^(昨日 )?\d{4}-\d{2}-\d{2}/.test(t)) { el.removeAttribute('data-wgt-cap'); continue; }
      if (t === text) { el.setAttribute('data-wgt-cap', '1'); continue; }
      el.textContent = text;
      el.setAttribute('data-wgt-cap', '1');
      n += 1;
    }
    return n;
  }

  function paint() {
    try { paintPlanClock(); } catch (e) {}
    var role = currentRole();
    var stats = statsOf(role);
    if (!stats) return 0;
    var mods = document.querySelectorAll('[data-testid="home-module-reports"]');
    var written = 0;
    for (var m = 0; m < mods.length; m += 1) {
      var mod = mods[m];
      if (!mod.getClientRects().length) continue;   /* RN 会保留多份隐藏副本 */
      var p = activePeriod(mod);
      var arr = stats[p] || [];
      if (stats.caption) written += paintCaption(mod, stats.caption[p]);
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

  /* 「今日作业安排」模块里的截止 / 逾期时间同样按系统当前时间算，
     演示基准日是 11/27，这里一并对齐（否则 11/20 会露馅） */
  var PLAN_RULES = [
    [/^已逾期 · \d{1,2}\/\d{1,2} \d{1,2}:\d{2}$/, '已逾期 · 11/27 14:00'],
    [/^截止 \d{1,2}\/\d{1,2} \d{1,2}:\d{2}$/, '截止 11/27 17:00']
  ];
  function paintPlanClock() {
    var mods = document.querySelectorAll('[data-testid="home-module-plan"]');
    for (var m = 0; m < mods.length; m += 1) {
      if (!mods[m].getClientRects().length) continue;
      var els = mods[m].querySelectorAll('div,span');
      for (var i = 0; i < els.length; i += 1) {
        var el = els[i];
        if (el.children.length) continue;
        var t = (el.textContent || '').trim();
        for (var r = 0; r < PLAN_RULES.length; r += 1) {
          if (PLAN_RULES[r][0].test(t) && t !== PLAN_RULES[r][1]) { el.textContent = PLAN_RULES[r][1]; break; }
        }
      }
    }
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
  /* iframe 一加载完就立刻刷一次，不必等 1.5s 轮询（消除首屏几秒的旧假数） */
  ['managerReportFrame', 'leaderReportFrame'].forEach(function (id) {
    var f = document.getElementById(id);
    if (f) f.addEventListener('load', function () { try { paint(); } catch (e) {} });
  });
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
