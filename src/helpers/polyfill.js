/*eslint no-extend-native: ["error", { "exceptions": ["Array"] }]*/
Object.defineProperty(Array.prototype, 'lastItem', {
  enumerable: false,
  configurable: false,
  get() {
    let len = this.length;
    if (len > 0) {
      return this[len - 1];
    } else {
      return undefined;
    }
  },
  set(value) {
    let len = this.length;
    if (len > 0) {
      len = len - 1;
    }
    return (this[len] = value);
  },
});

Object.defineProperty(Array.prototype, 'lastIndex', {
  enumerable: false,
  configurable: false,
  get() {
    let len = this.length;
    if (len > 0) {
      return len - 1;
    }
    return 0;
  },
});
