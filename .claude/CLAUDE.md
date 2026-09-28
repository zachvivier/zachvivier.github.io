# zachvivier.com

## Git

- Before editing, run `git fetch` and `git status -sb`. If `main` is behind `origin/main`, pull first so new work builds on the latest commits.
- Commit as `zachvivier <251772665+zachvivier@users.noreply.github.com>`. After each commit, check `git log -1 --format='%an <%ae>'` and fix the author before pushing if it is anything else (such as a hostname or `claude@localhost` address).

## Stylesheet cache-busting

Pages load `assets/site.css?v=<hash>`, where the hash is the first 12 characters of the file's SHA-256. After changing `site.css`, update the `?v=` value on every HTML page.
