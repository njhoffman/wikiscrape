const _ = require('lodash');
const fs = require('fs');
const logger = require('./logger');

const writeFiles = files => {
  const dirs = _.uniq(_.map(files, ([filepath]) => filepath.split('/').slice(0, -1).join('/')));
  _.each(dirs, dir => fs.mkdirSync(dir, { recursive: true }));
  // TODO: clean directories

  logger.info(`Writing: ${files.length} files...`);
  _.each(files, ([filepath, content], i) => {
    logger.debug(`    (${i + 1}/${files.length})  \t ${filepath}`);
    fs.writeFileSync(filepath, content);
  });
};

const writeIndex = async (targetPath, cheatsheets) => {
  const linesOut = [];
  _.each(_.sortBy(cheatsheets, 'category'), ({ category, name, title }) => {
    linesOut.push(`${category}\t${name}\t${title}`);
  });
  await writeFiles([[targetPath, linesOut.join('\n')]]);
};

module.exports = { writeFiles, writeIndex };
