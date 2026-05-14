/**
 * embed.js — Inject lesson data + audio sprite + shared lib into HTML template,
 * then minify the final single-file output.
 */
import { readFile } from "node:fs/promises";
import { minify } from "html-minifier-terser";

export async function renderTemplate(templatePath, replacements) {
  let html = await readFile(templatePath, "utf8");
  for (const [key, value] of Object.entries(replacements)) {
    const token = `{{${key}}}`;
    while (html.includes(token)) html = html.replace(token, value);
  }
  return html;
}

export async function minifyHtml(html) {
  return await minify(html, {
    collapseWhitespace: true,
    removeComments: true,
    minifyJS: true,
    minifyCSS: true,
    removeRedundantAttributes: true,
    removeScriptTypeAttributes: true,
    useShortDoctype: true,
    sortAttributes: true,
    sortClassName: true
  });
}
