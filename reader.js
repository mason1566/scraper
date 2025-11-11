const fs = require('node:fs');

function readJsonData(name) {
  fs.readFile(`/Users/masonjohnson/Projects/web/scraping/json/${name}.json`, 'utf8', (err, data) => {
    if (err) {
      console.error(err);
    } else {
      console.dir(JSON.parse(data), { depth: null });
    }
  });
}

readJsonData('1903225');