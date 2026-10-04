# donnysoh-tempsite

Personal portfolio site — plain HTML, CSS and a little vanilla JS. No frameworks, no build step.

## Local development

```bash
git clone https://github.com/donnysohsit/donnysoh-tempsite.git
cd donnysoh-tempsite
python -m http.server --directory public
```

Then open http://localhost:8000.

## Deploy

Push to `main`; GitHub Actions publishes `public/` to GitHub Pages.

See [CLAUDE.md](CLAUDE.md) for repo conventions.
