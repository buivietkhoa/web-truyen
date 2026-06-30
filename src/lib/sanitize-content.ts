import sanitizeHtml from "sanitize-html";

const allowedTags = [
  "p",
  "br",
  "strong",
  "b",
  "em",
  "i",
  "u",
  "s",
  "blockquote",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "a",
];

export function sanitizeRichContent(value: string) {
  return sanitizeHtml(value, {
    allowedTags,
    allowedAttributes: {
      a: ["href", "title", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto"],
    allowProtocolRelative: false,
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  }).trim();
}
