const _ = require('lodash');
const Promise = require('bluebird');
const axios = require('axios');
const path = require('path');
const { parse } = require('node-html-parser');
const https = require('https');

const config = require('../config');
const templates = require('./templates');
const logger = require('./logger');

const request = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

const tailwindScrape = async ({ url }) => {
  const startTime = new Date().getTime();
  logger.info(`Scraping ${url}`);
  debugger;
  const response = await request.get(url);
  const parsedHtml = parse(`${response.data}`);
  const entries = [];
  parsedHtml.querySelectorAll('h2').map(el => {
    console.log('EL', el);
    return el;
  });

  // console.log('PARSED', parsedHtml);
  // #app -> section -> div -> header -> h2 : 14
  // #app section div ul li div span' 131
  // #app section div ul li div -> span : 116
  // #app section div ul li div 355
};

const scrapeApis = async () => {
  // config.otherSides.map
  await tailwindScrape(config.otherSites[0]);
};

const scrapeIndex = async () => {
  logger.info(`Populating list from devhints.io...`);
  const response = await request.get('http://devhints.io');
  const parsedHtml = parse(`${response.data}`);
  const csList = templates.devhintsIndex(parsedHtml);
  return _.uniqBy(csList, ['category', 'name']);
};

const scrapeCheatsheets = async () => {
  const {
    cheatsheets: { url: csUrl, categoryFolder },
    basePath
  } = config;

  const pages = _.map(config.cheatsheets.selected, csId => {
    const [csCategory, slug] = csId.split(':');

    // if configured to form path with category, don't include redundant naming
    const targetPath = [
      basePath.replace(/\/$/, ''),
      categoryFolder ? csCategory : '',
      categoryFolder ? slug.replace(new RegExp(`${csCategory}-?`), '') : slug
    ]
      .filter(Boolean)
      .join('/');

    return {
      url: `${csUrl}/${slug}.md`,
      target: targetPath
    };
  });

  const startTime = new Date().getTime();
  logger.info(`Scraping: ${pages.length} pages from devhints.io`);
  const responses = await Promise.map(
    _.sortBy(pages, 'url'),
    (page, i) => {
      logger.debug(`  - ${i} ${page.url}`);
      return Promise.all([request.get(page.url), page]);
    },
    { concurrency: 1 }
  );

  const diffTime = ((new Date().getTime() - startTime) / 1000).toFixed(2);
  logger.info(`Finished scraping ${pages.length} pages in ${diffTime}s`);

  const filesOut = [];
  _.each(responses, ([response, { url, target }]) => {
    const files = templates.devhints(response.data.split('\n'));

    if (files.length === 1) {
      // use path as single file target if only one section/file returned
      filesOut.push([`${target}.md`, files[0].lines.join('\n')]);
    } else {
      // use path as directory for multiple files
      _.each(files, file => {
        return filesOut.push([`${target}/${file.name}.md`, file.lines.join('\n')]);
      });
    }
  });

  return filesOut;
};

module.exports = { scrapeCheatsheets, scrapeIndex, scrapeApis };
