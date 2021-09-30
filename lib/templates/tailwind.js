const _ = require('lodash');

const patterns = {
  ignore: [],
  substitute: [],
  categoryMap: []
};

//   return (
//     lines[i].length > 0 &&
//     lines[i + 1].length > 0 &&
//     Array(lines[i].length + 1).join('-') === lines[i + 1]
//   );
// };
//
// const devhintsIndex = html => {
//   const cheatsheets = html.querySelectorAll('a.article.item').map(el => {
//     let { category } = JSON.parse(el.getAttribute('data-js-searchable-item'));
//     patterns.categoryMap.some(({ name, display }) => {
//       if (_.toLower(name) === _.toLower(category)) {
//         category = display;
//         return true;
//       }
//       return false;
//     });
//
//     return {
//       category,
//       name: el.querySelector('span.info code.slug').rawText,
//       title: el.querySelector('span.info span.title').rawText
//     };
//   });
//   return cheatsheets;
// };
//
// const toFilename = text =>
//   _.toLower(text)
//     .replace(' (new)', '')
//     .replace(/ /g, '-')
//     .replace(/[^\w\d-]+/, '');
//
// const toHeaderLines = ({ title, category }, fileName) => {
//   const fileTitle = (fileName ? `${title} ${fileName.replace('-', ' ')}` : title) || '';
//   return ['---', `${fileTitle}`, `${category || ''}`, '---', ''];
// };
//
const tailwind = lines => {
  console.log('LINES', lines);
  return lines;
  // return files;
};

module.exports = { devhints, devhintsIndex };
