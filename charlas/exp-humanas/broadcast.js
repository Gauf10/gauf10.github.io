(function() {
  var channel;
  try { channel = new BroadcastChannel('gauf-presenter'); } catch(e) {}

  window.PresenterBus = {
    post: function(type, data) {
      if (!channel) return;
      var msg = { type: type };
      if (data) Object.keys(data).forEach(function(k) { msg[k] = data[k]; });
      channel.postMessage(msg);
    },
    on: function(fn) {
      if (!channel) return;
      channel.onmessage = function(e) { fn(e.data); };
    },
    available: function() { return !!channel; }
  };
})();
