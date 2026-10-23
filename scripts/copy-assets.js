const fs = require("fs");
const path = require("path");

const copies = [
  {
    from: path.resolve(__dirname, "../src/modules/analysis/profiles"),
    to: path.resolve(__dirname, "../dist/modules/analysis/profiles"),
  },
  {
    from: path.resolve(__dirname, "../src/modules/products/products.seed.json"),
    to: path.resolve(__dirname, "../dist/modules/products/products.seed.json"),
  },
];

for (const { from, to } of copies) {
  if (fs.existsSync(from)) {
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.cpSync(from, to, { recursive: true });
    console.log(`Asset copied: ${path.basename(from)} -> ${path.relative(path.resolve(__dirname, ".."), to)}`);
  }
}
