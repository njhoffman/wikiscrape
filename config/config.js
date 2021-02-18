const fs = require('fs');

const config = {
  baseTarget: '/home/nicholas/projects/wikiscrape/.data',
  cheatsheets: {
    baseFolder: 'cheat',
    url: 'https://raw.githubusercontent.com/rstacruz/cheatsheets/master',
    selected: ['bash', 'tmux']
  },
  otherSites: [
    // https://nerdcave.com/tailwind-cheat-sheet
    // lodash.com
    // material-ui
  ]
};

module.exports = config;
