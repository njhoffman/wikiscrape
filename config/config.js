const fs = require('fs');
const path = require('path');

const config = {
  basePath: '/home/nicholas/projects/wikiscrape/.data/cheat',
  cheatsheets: {
    categoryFolder: true,
    url: 'https://raw.githubusercontent.com/rstacruz/cheatsheets/master'
  },
  otherSites: [
    { url: 'https://nerdcave.com/tailwind-cheat-sheet', func: 'tailwindScrape' }

    // https://stripe.com/docs/cli/get
    // https://nerdcave.com/tailwind-cheat-sheet
    // lodash.com
    // material-ui
  ]
};

config.cheatsheets.selected = fs
  .readFileSync(path.resolve(__dirname, 'cheatsheets.txt'))
  .toString()
  .trim()
  .split('\n');

module.exports = config;
