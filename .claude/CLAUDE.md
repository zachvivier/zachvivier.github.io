# zachvivier.com

## Git

- Before editing, run `git fetch` and `git status -sb`. If `main` is behind `origin/main`, pull first so new work builds on the latest commits.
- Commit as `zachvivier <251772665+zachvivier@users.noreply.github.com>`. After each commit, check `git log -1 --format='%an <%ae>'` and fix the author before pushing if it is anything else (such as a hostname or `claude@localhost` address).

## Stylesheet cache-busting

Pages load `assets/site.css?v=<hash>`, where the hash is the first 12 characters of the file's SHA-256. After changing `site.css`, update the `?v=` value on every HTML page.

`assets/site.js` and `assets/dots.js` use the same `?v=` scheme. After changing either, update its value on every HTML page too.

## Design

The look follows Homelab Home: Geist fonts (`assets/fonts/`, OFL), neutral grays, tiles, pills, an island, and an animated dot field. The island is the floating pill with the latest post (class `notch`). Keep it floating: a notch joined to the top edge goes wrong on some devices. Every page repeats the same header, footer, and dot canvases; copy them from an existing page.

- Dots fade behind bare text, with no hard edge. `dots.js` does this for every text node on its own (`FADE` and `UNDER` set the distance and the strength). Text on an opaque panel is skipped: when you add a new kind of panel, add its selector to `PANELS` in `dots.js`.
- The profile photos have the avatar tile color (`--muted`) baked in as their backdrop, one per theme.

## Adding a post

1. Copy an existing post in `posts/` and change the text.
2. Add it at the top of `POSTS` in `assets/site.js` (the island's list), then update the `site.js` `?v=` value on every page.
3. Add its tile to `index.html` (newest six only), `posts.html`, and `search.html`.
4. Update the post count in the badge on `index.html`.
