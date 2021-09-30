const _ = require('lodash');

const patterns = {
  ignore: [/^See:? \[/, /^{: \./],
  substitute: [
    [/^```bash/, '```sh'],
    [/^```js/, '```javascript']
  ],
  categoryMap: [
    [{ name: 'JavaScript', display: 'JS' }],
    [{ name: 'JavaScript libraries', display: 'JS libs' }],
    [{ name: 'Java & JVM', display: 'Java' }],
    [{ name: 'Ruby libraries', display: 'Ruby libs' }]
  ]
};

const checkNewSection = (lines, i) => {
  return (
    lines[i].length > 0 &&
    lines[i + 1].length > 0 &&
    Array(lines[i].length + 1).join('-') === lines[i + 1]
  );
};

const devhintsIndex = html => {
  const cheatsheets = html.querySelectorAll('a.article.item').map(el => {
    let { category } = JSON.parse(el.getAttribute('data-js-searchable-item'));
    patterns.categoryMap.some(({ name, display }) => {
      if (_.toLower(name) === _.toLower(category)) {
        category = display;
        return true;
      }
      return false;
    });

    return {
      category,
      name: el.querySelector('span.info code.slug').rawText,
      title: el.querySelector('span.info span.title').rawText
    };
  });
  return cheatsheets;
};

const toFilename = text =>
  _.toLower(text)
    .replace(' (new)', '')
    .replace(/ /g, '-')
    .replace(/[^\w\d-]+/, '');

const toHeaderLines = ({ title, category }, fileName) => {
  const fileTitle = (fileName ? `${title} ${fileName.replace('-', ' ')}` : title) || '';
  return ['---', `${fileTitle}`, `${category || ''}`, '---', ''];
};

const devhints = lines => {
  const startIndex = _.indexOf(lines, '---', 2) + 2;
  const header = {
    title: _.find(lines, line => /^title:/.test(line)),
    category: _.find(lines, line => /^category:/.test(line))
  };

  // remove header section from lines to process
  lines.splice(0, startIndex);

  let newFile = { name: '', lines: toHeaderLines(header) };

  const files = [];
  _.each(lines, (line, i) => {
    if (checkNewSection(lines, i)) {
      files.push(newFile);
      const newFilename = toFilename(line);
      newFile = { name: newFilename, lines: toHeaderLines(header, newFilename) };
    }

    const ignored = patterns.ignore.some(pattern => pattern.test(line));
    if (!ignored) {
      let parsedLine = line;
      patterns.substitute.forEach(([pattern, replacement]) => {
        parsedLine = parsedLine.replace(pattern, replacement);
      });
      newFile.lines.push(parsedLine);
    }
  });

  files.push(newFile);

  if (files.length > 1) {
    // if multi-file remove content before first section, we don't want that in a file
    files.shift();
  }
  return files;
};

module.exports = { devhints, devhintsIndex };
