class LruCache {
  #cacheSize;
  #cache;

  #vaccum() {
    const now = Date.now();
    const keys = Object.keys(this.cache);
    keys.sort(
      (a, b) => this.cache[a].lastAccessed - this.cache[b].lastAccessed
    );

    while (keys.length > this.#cacheSize) {
      const oldestKey = keys.shift();
      delete this.cache[oldestKey];
    }
  }

  constructor(size) {
    this.#cacheSize = size;
    this.cache = {};
  }

  get(key) {
    const maybeCachedValue = this.cache[key];
    if (maybeCachedValue) {
      maybeCachedValue.lastAccessed = Date.now();
      return maybeCachedValue.value;
    }
    return null;
  }

  set(key, value) {
    if (this.cache[key]) {
      this.cache[key].value = value;
      this.cache[key].lastAccessed = Date.now();
    } else {
      this.cache[key] = {
        value: value,
        lastAccessed: Date.now(),
      };
    }
    this.#vaccum();
  }
}

module.exports = LruCache;
