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
};
