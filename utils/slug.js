const { default: slugify } = require("slugify");

module.exports.handleSlug = (name) => {
  return slugify(name, {
    replacement: "-",
    remove: /[^a-zA-Z0-9\u00C0-\u017F\s-]/g,
    lower: true,
    locale: "vi",
  });
};
