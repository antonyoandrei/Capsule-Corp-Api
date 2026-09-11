const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const handlers = new Map();
const middleware = [];
const app = {
  disable() {}, use(handler) { middleware.push(handler); },
  get(routes, handler) { for (const route of [].concat(routes)) handlers.set(route, handler); },
};
let mtime = 1;
let reads = 0;
let stats = 0;
let json = JSON.stringify({ clothes: [{ id: 1, img: "old.png", name: "Jacket" }], items: [] });
const sandbox = {
  __dirname: path.resolve(__dirname, "../api"), module: { exports: {} },
  require: name => ({
    fs: { statSync: () => { stats++; return { mtimeMs: mtime }; }, readFileSync: () => { reads++; return json; } },
    path, express: () => app, cors: () => () => {},
  })[name],
};
vm.runInNewContext(fs.readFileSync(path.join(__dirname, "../api/server.js"), "utf8"), sandbox);
const headers = {};
middleware[1]({}, { set(name, value) { headers[name] = value; } }, () => {});
assert.equal(headers["Cache-Control"], "no-cache", "Catalog responses must revalidate across deployments");
assert.equal(stats, 0, "Database checks start with a request, without a watcher");
assert.equal(reads, 0);
const request = route => {
  let body;
  const response = { set() {}, status() { return this; }, json(value) { body = value; } };
  handlers.get(route)({ query: {} }, response);
  return body;
};
assert.equal(request("/clothes")[0].img, "old.png");
request("/items");
assert.equal(reads, 1, "Unchanged files are not read or parsed again");
mtime++;
json = JSON.stringify({ clothes: [{ id: 1, img: "new.png", name: "Jacket" }], items: [] });
assert.equal(request("/clothes")[0].img, "new.png", "The next request sees an updated JSON file");
assert.equal(reads, 2);
mtime++;
json = "{";
assert.throws(() => request("/clothes"), /JSON/);
json = JSON.stringify({ clothes: [{ id: 1, img: "fixed.png", name: "Jacket" }], items: [] });
assert.equal(request("/clothes")[0].img, "fixed.png", "A failed parse does not mark that version as cached");
assert.equal(stats, 5);
console.log("API database checks passed: request-time mtime, cached parsing, updated URLs and recovery.");
