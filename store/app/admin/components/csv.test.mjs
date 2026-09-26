// Run: node app/admin/components/csv.test.mjs
import assert from 'node:assert/strict';
import { parseCsv, toCsv, csvToProducts, PRODUCT_CSV_HEADER, productToCsvRow } from './csv.js';

// Quotes, embedded commas/newlines, CRLF, BOM.
assert.deepEqual(parseCsv('﻿a,b\r\n"x, y","he said ""hi"""\n"multi\nline",2\n'), [
  ['a', 'b'], ['x, y', 'he said "hi"'], ['multi\nline', '2'],
]);
// Blank lines dropped, missing trailing newline ok.
assert.deepEqual(parseCsv('a\n\n b \n'), [['a'], [' b ']]);

// Round trip through toCsv.
const row = { id: 7, 'Tên sản phẩm': 'iPhone 15, Pro', 'Dung Lượng RAM/ROM': '8/256', 'Giá': '19990000', sale_price: null, stock: 0, badge: 'HOT', is_visible: false, 'Mô tả': 'Đẹp "như mới"' };
const csv = toCsv(PRODUCT_CSV_HEADER, [productToCsvRow(row)]);
const [p] = csvToProducts(parseCsv(csv));
assert.equal(p.id, '7');
assert.equal(p.name, 'iPhone 15, Pro');
assert.equal(p.price, '19990000');
assert.equal(p.stock, '0');
assert.equal(p.badge, 'HOT');
assert.equal(p.is_visible, false);
assert.equal(p.description, 'Đẹp "như mới"');

// Formula injection is neutralised; negative numbers are left alone.
assert.ok(toCsv(['x'], [['=HYPERLINK("evil")']]).includes(`'=HYPERLINK`));
assert.ok(toCsv(['x'], [['-5']]).endsWith('-5'));

// Missing required column is reported.
assert.throws(() => csvToProducts([['id', 'ten']]), /gia/);

console.log('csv ok');
