import { createClient } from "@sanity/client";
import { readFile } from "node:fs/promises";
const envText = await readFile(".env.local", "utf8");
const env = Object.fromEntries(envText.split("\n").filter(l=>l.includes("=")&&!l.trim().startsWith("#")).map(l=>{const i=l.indexOf("=");return [l.slice(0,i).trim(),l.slice(i+1).trim()];}));
const client = createClient({ projectId: env.NEXT_PUBLIC_SANITY_PROJECT_ID, dataset: env.NEXT_PUBLIC_SANITY_DATASET, apiVersion: "2024-12-01", token: env.SANITY_API_WRITE_TOKEN, useCdn: false });
await client.createOrReplace({
  _id: "siteSettings",
  _type: "siteSettings",
  siteName: "Enrika Creates",
  tagline: "Designer. Builder. Storyteller.",
  heroStatement: "I design storytelling experiences that inspire hope and ignite purpose.",
  newsletterTitle: "Enrika Creates",
  newsletterSub: "One letter. Four threads woven together.",
  newsletterThreads: [
    { _key: "t1", name: "Fashion", color: "#FC7F5A" },
    { _key: "t2", name: "Product", color: "#3498CE" },
    { _key: "t3", name: "Community Building", color: "#F7B5B1" },
    { _key: "t4", name: "Everyday Hope Stories", color: "#E8B84A" },
  ],
  socialLinks: [
    { _key: "s1", platform: "instagram", url: "https://instagram.com" },
    { _key: "s2", platform: "pinterest", url: "https://pinterest.com" },
    { _key: "s3", platform: "email", url: "mailto:enrika@smallgorillamarketing.com", label: "Email" },
  ],
  contactEmail: "enrika@smallgorillamarketing.com",
  footerCopy: "© {year} Enrika Greathouse",
});
console.log("✓ siteSettings seeded");
