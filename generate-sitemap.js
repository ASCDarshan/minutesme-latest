import { SitemapStream, streamToPromise } from "sitemap";
import { createWriteStream, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const BASE_URL = "https://makemyminutes.com/";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateSitemap() {
  try {
    const sitemap = new SitemapStream({ hostname: BASE_URL });
    const sitemapPath = resolve(__dirname, "public", "sitemap.xml");
    const writeStream = createWriteStream(sitemapPath);

    writeStream.on("error", (err) => {
      console.error("Error writing sitemap file:", err);
    });

    const staticLinks = [
      // Highest priority
      { url: "/", changefreq: "daily", priority: 1.0 },

      // High priority
      { url: "/about-us", changefreq: "daily", priority: 0.8 },
      { url: "/contact-us", changefreq: "daily", priority: 0.8 },
      { url: "/our-team", changefreq: "daily", priority: 0.8 },

      // Medium priority
      { url: "/cookies", changefreq: "daily", priority: 0.5 },
      { url: "/copyright", changefreq: "yearly", priority: 0.5 },
      { url: "/privacy-policy", changefreq: "yearly", priority: 0.5 },
      { url: "/terms-and-conditions", changefreq: "yearly", priority: 0.5 },
    ];

    staticLinks.forEach((link) => sitemap.write(link));

    sitemap.end();

    const data = await streamToPromise(sitemap);
    writeStream.write(data);
    writeStream.end();

    const robotsTxtContent = `User-agent: *
Disallow:

Sitemap: ${BASE_URL}sitemap.xml
`;

    const robotsTxtPath = resolve(__dirname, "public", "robots.txt");
    writeFileSync(robotsTxtPath, robotsTxtContent);

    console.log("✅ Sitemap and robots.txt generated successfully!");
  } catch (err) {
    console.error("Error generating sitemap:", err);
    process.exit(1);
  }
}

generateSitemap();
