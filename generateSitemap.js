// generateSitemap.js
const { SitemapStream, streamToPromise } = require("sitemap");
const { Readable } = require("stream");
const fs = require("fs");

const pages = [
  { url: "/", changefreq: "daily", priority: 1 },
  { url: "/how-to-use", changefreq: "monthly", priority: 0.8 },
  { url: "/privacy", changefreq: "monthly", priority: 0.6 },
  { url: "/contact", changefreq: "monthly", priority: 0.6 },
];

const sitemapStream = new SitemapStream({ hostname: "https://textformat.io" });
const xml = Readable.from(pages).pipe(sitemapStream);

streamToPromise(xml)
  .then((data) => {
    fs.writeFileSync("public/sitemap.xml", data.toString());
    console.log("Sitemap generated successfully.");
  })
  .catch((error) => {
    console.error("Error generating sitemap:", error);
  });
