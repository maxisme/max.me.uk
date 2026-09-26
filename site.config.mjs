// Site-wide settings. Replaces the old config.toml.
//
// Note: config.toml declared a Google Analytics partial but never set a
// `googleAnalytics` key, so Hugo rendered nothing for it. Dropped rather than
// carried over — add a real tag here if you ever want analytics back.
export default {
  baseURL: "https://max.me.uk",
  title: "Maximilian Mitchell",
  languageCode: "en-gb",
  disqusShortname: "max-me-uk",

  // Feeds the schema.org Person markup in templates.mjs. `sameAs` is what lets
  // search engines connect this site to the same person's other profiles.
  author: {
    name: "Maximilian Mitchell",
    alternateNames: ["Max Mitchell", "maxisme"],
    email: "max@max.me.uk",
    jobTitle: "Software Engineer",
    sameAs: [
      "https://github.com/maxisme",
      "https://www.linkedin.com/in/maxisme",
      "https://stackoverflow.com/story/maxisme",
      "https://twitter.com/maxisme",
    ],
  },
};
