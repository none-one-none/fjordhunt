/* Fjordhunt core — progress, geo maths, shared helpers.
   Plain script, no modules, no fetch. Works from file:// and from any host. */

window.Hunt = (function () {
  var KEY = "fjordhunt.progress.v1";
  var DEV = "fjordhunt.dev";

  function config() {
    return window.HUNT;
  }

  /* ---------- progress ---------- */

  function load() {
    try {
      var p = JSON.parse(localStorage.getItem(KEY));
      if (p && Array.isArray(p.done)) return p;
    } catch (e) {}
    return { done: [], started: null };
  }

  function save(p) {
    try {
      localStorage.setItem(KEY, JSON.stringify(p));
    } catch (e) {}
  }

  function isDone(i) {
    return load().done.indexOf(i) > -1;
  }

  function complete(i) {
    var p = load();
    if (p.done.indexOf(i) < 0) p.done.push(i);
    if (!p.started) p.started = Date.now();
    p.updated = Date.now();
    save(p);
  }

  function reset() {
    try {
      localStorage.removeItem(KEY);
    } catch (e) {}
  }

  /* Index of the stop the player should be heading to, or -1 if all done. */
  function currentIndex() {
    var p = load();
    var stops = config().stops;
    for (var i = 0; i < stops.length; i++) {
      if (p.done.indexOf(i) < 0) return i;
    }
    return -1;
  }

  /* A stop is reachable if it is done, or it is the current one. */
  function isUnlocked(i) {
    return isDone(i) || i === currentIndex();
  }

  /* ---------- dev mode: skip the geofence so you can test indoors ---------- */

  function devOn() {
    try {
      return localStorage.getItem(DEV) === "1";
    } catch (e) {
      return false;
    }
  }

  function setDev(on) {
    try {
      if (on) localStorage.setItem(DEV, "1");
      else localStorage.removeItem(DEV);
    } catch (e) {}
  }

  /* ---------- geo ---------- */

  function toRad(d) {
    return (d * Math.PI) / 180;
  }

  /* Great-circle distance in metres. */
  function distance(lat1, lng1, lat2, lng2) {
    var R = 6371000;
    var dLat = toRad(lat2 - lat1);
    var dLng = toRad(lng2 - lng1);
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) *
        Math.cos(toRad(lat2)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    return 2 * R * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  /* Initial bearing from point 1 to point 2, degrees clockwise from north. */
  function bearing(lat1, lng1, lat2, lng2) {
    var y = Math.sin(toRad(lng2 - lng1)) * Math.cos(toRad(lat2));
    var x =
      Math.cos(toRad(lat1)) * Math.sin(toRad(lat2)) -
      Math.sin(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.cos(toRad(lng2 - lng1));
    return (((Math.atan2(y, x) * 180) / Math.PI) + 360) % 360;
  }

  /* Smallest signed angle between two headings, -180..180. */
  function angleDelta(a, b) {
    return ((((b - a) % 360) + 540) % 360) - 180;
  }

  function formatDistance(m) {
    if (m < 1000) return Math.round(m) + " m";
    return (m / 1000).toFixed(1) + " km";
  }

  /* ---------- misc ---------- */

  function param(name) {
    var m = new RegExp("[?&]" + name + "=([^&]*)").exec(window.location.search);
    return m ? decodeURIComponent(m[1]) : null;
  }

  function stopAt(i) {
    var s = config().stops;
    return i >= 0 && i < s.length ? s[i] : null;
  }

  /* ?dev=1 in the URL turns dev mode on and keeps it on. */
  if (param("dev") === "1") setDev(true);
  if (param("dev") === "0") setDev(false);

  return {
    config: config,
    stopAt: stopAt,
    isDone: isDone,
    complete: complete,
    reset: reset,
    currentIndex: currentIndex,
    isUnlocked: isUnlocked,
    devOn: devOn,
    setDev: setDev,
    distance: distance,
    bearing: bearing,
    angleDelta: angleDelta,
    formatDistance: formatDistance,
    param: param,
  };
})();
