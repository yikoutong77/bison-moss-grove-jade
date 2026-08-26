(function () {
  if (window.__TAVERN_BOOT) return;
  window.__TAVERN_BOOT = true;
  window.__TAVERN_BOOT_DONE = false;

  var started = performance.now();
  var root = document.createElement("div");
  root.id = "cold-boot";
  root.setAttribute(
    "style",
    "position:fixed;inset:0;z-index:90;display:grid;place-items:center;background:#120c08;color:#f3ead8;font-family:system-ui,sans-serif",
  );
  root.innerHTML =
    '<div style="width:min(26rem,calc(100% - 2rem));text-align:center">' +
    '<div style="letter-spacing:.28em;font-size:12px;opacity:.7">八人混战</div>' +
    '<div style="font-size:32px;margin-top:8px;font-weight:600">酒馆战棋</div>' +
    '<div id="boot-status" style="margin-top:10px;font-size:13px;opacity:.7">正在读取资源清单</div>' +
    '<div style="margin-top:28px;height:8px;border:1px solid #3d2e1f;border-radius:99px;background:#1c140e;overflow:hidden">' +
    '<div id="boot-fill" style="height:100%;width:0%;background:#f0d080"></div></div>' +
    '<div style="margin-top:12px;display:flex;justify-content:space-between;gap:12px;font-size:13px">' +
    '<span id="boot-pct" style="color:#f0d080;font-variant-numeric:tabular-nums">0%</span>' +
    '<span id="boot-count" style="opacity:.7;font-variant-numeric:tabular-nums">0/0</span></div>' +
    '<div style="margin-top:6px;display:flex;justify-content:space-between;gap:12px;font-size:12px;opacity:.55">' +
    '<span id="boot-file" style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">…</span>' +
    '<span id="boot-time" style="font-variant-numeric:tabular-nums">0 ms</span></div></div>';

  function mount() {
    if (!root.isConnected) document.documentElement.appendChild(root);
  }
  if (document.documentElement) mount();
  else document.addEventListener("DOMContentLoaded", mount);

  var fill = null;
  var pctEl = null;
  var countEl = null;
  var fileEl = null;
  var timeEl = null;
  var statusEl = null;

  function els() {
    fill = fill || document.getElementById("boot-fill");
    pctEl = pctEl || document.getElementById("boot-pct");
    countEl = countEl || document.getElementById("boot-count");
    fileEl = fileEl || document.getElementById("boot-file");
    timeEl = timeEl || document.getElementById("boot-time");
    statusEl = statusEl || document.getElementById("boot-status");
  }

  function fmtMs(ms) {
    return ms < 1000 ? Math.round(ms) + " ms" : (ms / 1000).toFixed(1) + " s";
  }

  function paint(loaded, total, name) {
    els();
    var pct = total ? Math.round((loaded / total) * 100) : 0;
    if (fill) fill.style.width = pct + "%";
    if (pctEl) pctEl.textContent = pct + "%";
    if (countEl) countEl.textContent = loaded + "/" + total;
    if (fileEl) fileEl.textContent = name || "";
    if (timeEl) timeEl.textContent = fmtMs(performance.now() - started);
  }

  function loadOne(url) {
    return new Promise(function (resolve) {
      var img = new Image();
      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        resolve(url);
      };
      img.onload = finish;
      img.onerror = finish;
      img.src = url;
      setTimeout(finish, 8000);
    });
  }

  function finish() {
    window.__TAVERN_BOOT_DONE = true;
    if (statusEl) statusEl.textContent = "就绪";
    paint(1, 1, "就绪");
    window.dispatchEvent(new Event("tavern-boot-done"));
  }

  function run(urls) {
    if (statusEl) statusEl.textContent = "正在装填卡图与英雄立绘";
    var total = urls.length || 1;
    var loaded = 0;
    paint(0, total, urls[0] ? urls[0].split("/").pop() : "");
    var i = 0;
    var workers = 6;
    function next() {
      if (i >= urls.length) return Promise.resolve();
      var url = urls[i++];
      paint(loaded, total, url.split("/").pop());
      return loadOne(url).then(function () {
        loaded += 1;
        paint(loaded, total, url.split("/").pop());
        if (loaded >= total) return;
        return next();
      });
    }
    var jobs = [];
    for (var w = 0; w < workers; w++) jobs.push(next());
    Promise.all(jobs).then(finish);
  }

  fetch("/boot-assets.json", { cache: "no-cache" })
    .then(function (r) {
      if (!r.ok) throw new Error("manifest");
      return r.json();
    })
    .then(run)
    .catch(function () {
      if (statusEl) statusEl.textContent = "清单失败，直接进入";
      run(["/tavern-bg.jpg"]);
    });

  setTimeout(function () {
    if (!window.__TAVERN_BOOT_DONE) finish();
  }, 20000);
})();
