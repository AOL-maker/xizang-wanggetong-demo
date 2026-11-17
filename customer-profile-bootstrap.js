(function () {
  var layer = null;
  var frame = null;
  var opened = false;

  function ensureLayer() {
    if (layer) return;
    layer = document.createElement('div');
    layer.id = 'customerProfileLayer';
    layer.style.cssText = 'position:fixed;inset:0;z-index:9999;background:#fff;display:none;';
    frame = document.createElement('iframe');
    frame.id = 'customerProfileFrame';
    frame.title = '个人客户画像';
    frame.style.cssText = 'border:0;width:100%;height:100%;display:block;background:#f5f7fa;';
    frame.src = 'about:blank';
    layer.appendChild(frame);
    document.body.appendChild(layer);
  }

  function openProfile() {
    if (opened) return;
    ensureLayer();
    opened = true;
    frame.src = './customer-profile.html';
    layer.style.display = 'block';
    document.body.style.overflow = 'hidden';
  }

  function closeProfile() {
    if (!opened) return;
    opened = false;
    layer.style.display = 'none';
    frame.src = 'about:blank';
    document.body.style.overflow = '';
  }

  function clickButton(label) {
    var candidates = Array.prototype.slice.call(document.querySelectorAll('[role="button"],button'));
    var target = candidates.find(function (node) {
      return (node.innerText || '').trim() === label || node.getAttribute('aria-label') === label;
    });
    if (target) target.click();
    return !!target;
  }

  window.addEventListener('message', function (event) {
    if (!event || !event.data) return;
    if (event.data.type === 'closeCustomerProfile') {
      closeProfile();
      if (event.data.back) setTimeout(function () { clickButton('返回'); }, 20);
    }
    if (event.data.type === 'openCustomerService') {
      closeProfile();
      setTimeout(function () {
        if (!clickButton('为客户办理业务')) clickButton('业务受理');
      }, 60);
    }
  });

  document.addEventListener('click', function (event) {
    var node = event.target;
    for (var i = 0; i < 5 && node; i += 1, node = node.parentElement) {
      var text = (node.innerText || '').trim();
      if (text === '客户画像' && (node.getAttribute('aria-label') || node.innerText || '').indexOf('个人客户画像') < 0) {
        setTimeout(openProfile, 120);
        return;
      }
      if (text.length > 20) break;
    }
  }, true);

  if (location.hash === '#customer-profile') setTimeout(openProfile, 300);
  window.__openCustomerProfile = openProfile;
})();
