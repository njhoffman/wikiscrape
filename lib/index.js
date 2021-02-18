const _ = require('lodash');
const PrettyError = require('pretty-error');
const { program } = require('commander');

const { version, name: appName } = require('../package');
const logger = require('./logger');
const { scrapeIndex, startScraper } = require('./scraper');
const { writeIndex, writeFiles } = require('./files');

const pe = new PrettyError();

program.name(appName).version(version);

program
  .command('update', { isDefault: true })
  .description('Scrape and update configured APIs')
  .action(async () => {
    const filesOut = await startScraper();
    await writeFiles(filesOut);
  });

program
  .command('list')
  .description('Show available cheatsheets from devhints.io')
  .action(async () => {
    const cheatsheets = await scrapeIndex();
    await writeIndex('./devhints.txt', cheatsheets);
    // _.groupBy(cheatList, 'category');
  });

program.exitOverride();

try {
  program.parse(process.argv);
} catch (err) {
  if (err.message === '(outputHelp)') {
    process.exit(0);
  }
  logger.error(pe.render(err));
  process.exit(1);
}

process.on('unhandledRejection', err => {
  logger.error('Unhandled Rejection', pe.render(err));
  process.exit(1);
});

process.on('unhandledException', err => {
  logger.error('Unhandled Exception', pe.render(err));
  process.exit(1);
});
