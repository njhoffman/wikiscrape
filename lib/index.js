const _ = require('lodash');
const PrettyError = require('pretty-error');
const { program } = require('commander');

const logger = require('./logger');
const { scrapeIndex, scrapeApis, scrapeCheatsheets } = require('./scraper');
const { writeIndex, writeFiles } = require('./files');

const name = 'wikiscrape';
const version = '1.0.0';

const pe = new PrettyError();

program.name(name).version(version);

program
  .command('update', { isDefault: true })
  .description('Update other API sites')
  .action(async () => {
    const filesOut = await scrapeApis();
    // await writeFiles(filesOut);
  });

program
  .command('update-cheat')
  .description('Scrape and update configured APIs')
  .action(async () => {
    const filesOut = await scrapeCheatsheets();
    await writeFiles(filesOut);
  });

program
  .command('list-cheat')
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
