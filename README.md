# Columbus Crew Roster Scraper

Small Sinatra app that scrapes the live Columbus Crew roster page and exposes the roster as JSON, plus a simple browser UI.

## Scrape Source

- Target URL: `https://www.columbuscrew.com/roster/`
- Scraping is live at request time (no local database).

## What The App Provides

- Roster cards UI at `/`
- Player detail UI at `/player/:id`
- API endpoints:
  - `GET /players`
  - `GET /players/:id`

## Data Returned

Each player record currently includes:

- `id`
- `name`
- `num`
- `pos`
- `role`
- `img`
- `bio_url`
- `stats_url`
- `source`
- `age`
- `birthplace`
- `height`
- `weight`

Notes:
- `age`, `birthplace`, `height`, and `weight` are currently returned as `null` because they are not present on the roster page markup being scraped.
- Image URLs are pulled from lazy-loaded image attributes on the source roster cards.

## Prerequisites

- `asdf` (recommended, because project uses `.tool-versions`)
- Ruby `4.0.1`
- Bundler (installed with Ruby)

## Local Setup

```bash
asdf install
```

## Run With Makefile (Recommended)

```bash
make start
```

This will:
- run `bundle install`
- start the app with `rackup` on port `9393`
- write PID to `.app.pid`
- write logs to `.app.log`

Useful commands:

```bash
make status
make stop
```

## Run Manually

```bash
asdf exec bundle install
asdf exec bundle exec rackup -p 9393
```

Open:
- `http://localhost:9393/`

## UI Features

- `View Raw JSON` button opens a modal.
- Modal fetches `/players` and displays formatted JSON.
- Modal closes via:
  - `Close` button
  - clicking the backdrop
  - `Esc` key

## Troubleshooting

- If old/stale data appears, ensure only one app process is running and restart with `make stop` then `make start`.
- If startup fails, inspect `.app.log`.
- If scraping breaks, the source site likely changed markup; update selectors in [`player.rb`](/Users/briancrosby/Projects/PG_Crew_Scraper/player.rb).
