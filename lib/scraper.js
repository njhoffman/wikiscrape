const _ = require('lodash');
const axios = require('axios');
const path = require('path');
const { parse } = require('node-html-parser');
const https = require('https');

const config = require('config');
const templates = require('./templates');
const logger = require('./logger');

const request = axios.create({
  httpsAgent: new https.Agent({
    rejectUnauthorized: false
  })
});

const parseHtml = html => {
  const parsedHtml = parse(`${html}`);
  // #content #main-content table#searchResult tbody tr
  const searchResults = parsedHtml.querySelector('.body-area');
  if (!searchResults) {
    throw new Error('No search results found');
  }
  return searchResults;
};

const scrapeIndex = async () => {
  logger.info(`Populating list from devhints.io...`);
  const response = await request.get('http://devhints.io');
  const parsedHtml = parse(`${response.data}`);

  const cheatsheets = parsedHtml.querySelectorAll('a.article.item').map(el => {
    const { category } = JSON.parse(el.getAttribute('data-js-searchable-item'));
    return {
      category,
      name: el.querySelector('span.info code.slug').rawText,
      title: el.querySelector('span.info span.title').rawText
    };
  });
  return cheatsheets;
};

const scrapeCheatsheets = async () => {
  const { cheatsheets: csConfig, baseTarget } = config;
  const sites = _.map(config.cheatsheets.selected, slug => ({
    url: `${csConfig.url}/${slug}.md`,
    target: `${csConfig.basePath}/${slug}`
  }));
  const startTime = new Date().getTime();

  logger.info(`Scraping: ${sites.length} sites...`);
  const siteRequests = sites.map(site => Promise.all([request.get(site.url), site]));
  const responses = await Promise.all(siteRequests);

  const filesOut = [];
  _.each(responses, ([response, { url, template, target }]) => {
    const diffTime = ((new Date().getTime() - startTime) / 1000).toFixed(2);
    logger.info(`Finished scraping ${sites.length} sites in ${diffTime}s`);

    const responseData = /.md$/.test(url) ? response.data.split('\n') : parse(response.data);
    const files = templates[template](responseData);

    if (files.length === 1) {
      // use path as single file target if only one section/file returned
      filesOut.push([`${path.resolve(baseTarget, target)}.md`, files[0].lines.join('\n')]);
    } else {
      // use path as directory for multiple files
      _.each(files, file => {
        return filesOut.push([
          `${path.resolve(baseTarget, target, file.name)}.md`,
          file.lines.join('\n')
        ]);
      });
    }
  });
  return filesOut;
};

module.exports = { scrapeCheatsheets, scrapeIndex };
