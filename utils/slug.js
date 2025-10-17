const { default: slugify } = require("slugify");

module.exports.handleSlug = async (name, model) => {
  let baseSlug = slugify(name, {
    replacement: "-",
    remove: /[^a-zA-Z0-9\u00C0-\u017F\s-]/g,
    lower: true,
    locale: "vi",
  });

  let slug = baseSlug;
  let counter = 1;
  while (await model.exists({ slug })) {
    slug = `${baseSlug}-${counter++}`;
  }

  return slug;
};
