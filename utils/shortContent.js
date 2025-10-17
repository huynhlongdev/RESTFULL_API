module.exports.shortContent = (content, maxWords) => {
  const rawDesc = content ?? "";
  const noHtml = rawDesc.replace(/<[^>]*>/g, "");
  const words = noHtml.trim().split(/\s+/).filter(Boolean);
  return words.length > 0
    ? words.length > maxWords
      ? words.slice(0, maxWords).join(" ") + "..."
      : words.join(" ")
    : "";
};
