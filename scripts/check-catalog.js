const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const path = require('node:path');

const catalog = JSON.parse(readFileSync(path.join(__dirname, '..', 'db.json'), 'utf8'));
const products = [...catalog.clothes, ...catalog.items];
const ids = new Set();
const styles = new Map();

for (const product of products) {
  assert(Number.isInteger(product.id) && !ids.has(product.id), `Duplicate or invalid ID: ${product.id}`);
  ids.add(product.id);
  assert(product.name.trim() && product.description.trim(), `Missing copy: ${product.id}`);
  assert(Number.isFinite(Number(product.price)) && Number(product.price) > 0, `Invalid price: ${product.id}`);
  assert(Array.isArray(product.images) && product.images.length, `Empty gallery: ${product.id}`);
  assert.equal(new Set(product.images).size, product.images.length, `Repeated gallery image: ${product.id}`);
  for (const source of [product.img, ...product.images]) {
    const url = new URL(source);
    assert(url.protocol === 'https:' && url.hostname === 'res.cloudinary.com', `Invalid image URL: ${product.id}`);
    assert(url.pathname.startsWith('/du94mex28/image/upload/'), `Wrong image source: ${product.id}`);
  }
  if (product.style) {
    assert(product.style.group && product.style.label, `Incomplete style: ${product.id}`);
    const labels = styles.get(product.style.group) || new Set();
    assert(!labels.has(product.style.label), `Duplicate style label: ${product.style.group}`);
    labels.add(product.style.label);
    styles.set(product.style.group, labels);
    if (product.style.color) assert(/^#[a-f\d]{6}$/i.test(product.style.color), `Invalid style color: ${product.id}`);
  }
}
for (const [group, labels] of styles) assert(labels.size > 1, `Style group has no alternatives: ${group}`);
console.log(`Catalog checked: ${products.length} products, unique IDs, valid galleries and ${styles.size} style groups.`);
