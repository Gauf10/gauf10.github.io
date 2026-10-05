(function() {
  var KEY = 'gauf-presenter';

  window.PresenterBus = {
    post: function(type, data) {
      var msg = { type: type, ts: Date.now() };
      if (data) {
        for (var k in data) {
          if (Object.prototype.hasOwnProperty.call(data, k)) msg[k] = data[k];
        }
      }
      try { localStorage.setItem(KEY, JSON.stringify(msg)); } catch(e) {}
    },
    on: function(fn) {
      window.addEventListener('storage', function(e) {
        if (e.key !== KEY || !e.newValue) return;
        try { fn(JSON.parse(e.newValue)); } catch(err) {}
      });
    },
    available: function() {
      try { return typeof localStorage !== 'undefined'; } catch(e) { return false; }
    }
  };
})();
