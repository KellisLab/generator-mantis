(function () {
  var root = document.getElementById('root');
  root.textContent = 'Loading maps...';
  mantis
    .maps.list()
    .then(function (data) {
      var pre = document.createElement('pre');
      pre.style.margin = '12px';
      pre.style.font = '12px/1.4 system-ui,sans-serif';
      pre.style.whiteSpace = 'pre-wrap';
      pre.textContent = JSON.stringify(data, null, 2);
      root.innerHTML = '';
      root.appendChild(pre);
    })
    .catch(function (err) {
      root.textContent = err && err.message ? err.message : String(err);
    });
})();
