const _ = require('lodash');

const ignorePatterns = [/^See:? \[/, /^{: \./];
const replacePatterns = [[/^```bash/, '```sh']];

const checkNewSection = (lines, i) => {
  return (
    lines[i].length > 0 &&
    lines[i + 1].length > 0 &&
    Array(lines[i].length + 1).join('-') === lines[i + 1]
  );
};

const devhints = lines => {
  // remove header section
  const startIndex = _.indexOf(lines, '---', 2) + 2;
  lines.splice(0, startIndex);

  let newFile = {
    name: '',
    lines: [],
    start: true
  };

  const files = [];
  _.each(lines, (line, i) => {
    if (checkNewSection(lines, i)) {
      // leave off anything before first section
      if (!newFile.start) {
        files.push(newFile);
      }
      newFile = { name: _.toLower(lines[i]).replace(/ /g, '-'), lines: [] };
    }

    const ignored = ignorePatterns.some(pattern => pattern.test(line));
    if (!ignored) {
      let parsedLine = line;
      replacePatterns.forEach(([pattern, replacement]) => {
        parsedLine = parsedLine.replace(pattern, replacement);
      });
      newFile.lines.push(parsedLine);
    }
  });
  files.push(newFile);
  return files;
};

module.exports = { devhints };
