const _ = require('lodash');
const fs = require('fs');
const chalk = require('chalk');
const logger = require('./logger');
const config = require('../config');

const padLeft = (input, len) => {
  const str = _.isString(input.toString()) ? input.toString() : '';
  return len > str.length ? new Array(len - str.length + 1).join(' ') + str : str;
};

const padRight = (input, len) => {
  const str = _.isString(input.toString()) ? input.toString() : '';
  return len > str.length ? str + new Array(len - str.length + 1).join(' ') : str;
};

const writeFiles = files => {
  const dirs = _.uniq(_.map(files, ([filepath]) => filepath.split('/').slice(0, -1).join('/')));
  _.each(dirs, dir => fs.mkdirSync(dir, { recursive: true }));
  // TODO: clean directories

  logger.info(`Writing: ${files?.length} files...`);
  _.each(files, ([filepath, content], i) => {
    const newPath = filepath.split(config.basePath)[1];
    const [newFolder, newFile] = [
      newPath.split('/').slice(0, -1).join('/').slice(1),
      newPath.split('/').slice(-1)[0]
    ];
    const basePath = config.basePath.replace(new RegExp(process.env.HOME), '~');
    logger.debug(
      `${padLeft(`${i + 1}/${files.length}`, 8)}`,
      `${chalk.gray(padLeft(`${content.length} l`, 12))}`,
      `${padLeft(basePath, basePath.length + 2)}/${chalk.cyan(newFolder)}/${chalk.green(newFile)}`
    );

    fs.writeFileSync(filepath, content);
  });
};

const writeIndex = async (targetPath, cheatsheets) => {
  const cols = {
    spacing: 2,
    category: _.maxBy(cheatsheets, cs => cs.category.length).category.length,
    name: _.maxBy(cheatsheets, cs => cs.name.length).name.length
  };

  const linesOut = [];
  _.each(_.sortBy(cheatsheets, ['category', 'name']), ({ category, name, title }) => {
    linesOut.push(
      [
        chalk.gray(padRight(category, cols.category + cols.spacing)),
        chalk.cyan(padRight(name, cols.name + cols.spacing)),
        title
      ].join('')
    );
  });
  await writeFiles([[targetPath, linesOut.join('\n')]]);
};

module.exports = { writeFiles, writeIndex };
