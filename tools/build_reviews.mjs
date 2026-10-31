// Fetches THE LAB's real Google rating, review count and reviews and writes
// src/assets/data/reviews.json, which src/assets/js/reviews.js renders.
//
// Source: Places API (New), Place Details, with a field mask so only the
// rating, review count, Google links and reviews come back. Reviews are written
// exactly as Google returns them: no editing, no filtering, no reordering.
// Google returns at most 5 reviews; the rating and count are for ALL reviews.
//
// Vercel runs it on every deploy (vercel.json buildCommand). It never fails the
// build: with no key, or if Google cannot be reached, it writes nothing and
// exits 0, and the pages keep their static fallback quotes (no rating, no count).
// The generated file is gitignored.
//
// Environment (Vercel project settings, Production and Preview):
//   GOOGLE_PLACES_API_KEY   required. Restrict it to "Places API (New)".
//   GOOGLE_PLACE_ID         optional. Defaults to THE LAB's Place ID (not a secret).
//
//   node tools/build_reviews.mjs                    live Google
//   node tools/build_reviews.mjs --fixture f.json   a saved Place Details response, for testing
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUT = path.join(ROOT, "src", "assets", "data", "reviews.json");
const PLACE_ID = process.env.GOOGLE_PLACE_ID || "ChIJLb7O7iG4sAAR0VMOjg6nIPM";
const FIELDS = "rating,userRatingCount,googleMapsUri,googleMapsLinks,reviews";

const fixtureAt = process.argv.indexOf("--fixture");
const fixture = fixtureAt > -1 ? process.argv[fixtureAt + 1] : null;

function skip(reason) {
  console.log("build_reviews: skipped (" + reason + "). Pages keep their static quotes.");
  process.exit(0);
}

async function load() {
  if (fixture) return JSON.parse(fs.readFileSync(fixture, "utf8"));
  const key = process.env.GOOGLE_PLACES_API_KEY;
  if (!key) skip("GOOGLE_PLACES_API_KEY is not set");
  const url = "https://places.googleapis.com/v1/places/" + encodeURIComponent(PLACE_ID) + "?languageCode=en";
  const res = await fetch(url, {
    headers: { "X-Goog-Api-Key": key, "X-Goog-FieldMask": FIELDS },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) {
    // Never print the key. Google's error body names the problem (key restriction, API not enabled).
    const body = (await res.text()).slice(0, 300).replace(key, "[key]");
    skip("Google answered " + res.status + ": " + body);
  }
  return res.json();
}

function clean(s) {
  return typeof s === "string" ? s : "";
}

try {
  const place = await load();
  const reviews = (Array.isArray(place.reviews) ? place.reviews : [])
    .map((r) => ({
      author: clean(r.authorAttribution && r.authorAttribution.displayName),
      authorUrl: clean(r.authorAttribution && r.authorAttribution.uri),
      photo: clean(r.authorAttribution && r.authorAttribution.photoUri),
      rating: Number(r.rating) || 0,
      when: clean(r.relativePublishTimeDescription),
      published: clean(r.publishTime),
      text: clean((r.originalText && r.originalText.text) || (r.text && r.text.text)),
      url: clean(r.googleMapsUri),
    }))
    .filter((r) => r.author && r.rating >= 1 && r.rating <= 5 && r.text);

  const rating = Number(place.rating);
  const count = Number(place.userRatingCount);
  if (!rating || !count) skip("Google returned no rating or review count");

  const links = place.googleMapsLinks || {};
  const data = {
    fetched: new Date().toISOString(),
    rating,
    count,
    mapsUrl: clean(place.googleMapsUri),
    reviewsUrl: clean(links.reviewsUri) || "https://search.google.com/local/reviews?placeid=" + encodeURIComponent(PLACE_ID),
    writeUrl: clean(links.writeAReviewUri) || "https://search.google.com/local/writereview?placeid=" + encodeURIComponent(PLACE_ID),
    reviews,
  };

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(data, null, 1));
  console.log("build_reviews: wrote " + reviews.length + " reviews, rating " + rating + " from " + count + " Google reviews.");
} catch (err) {
  skip(err && err.message ? err.message : "unexpected error");
}
