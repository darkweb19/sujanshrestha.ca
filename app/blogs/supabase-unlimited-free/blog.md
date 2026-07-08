---
title: "Keeping Supabase Alive on the Free Tier With a Simple Cron Job"
date: "2026-07-08"
description: "Supabase pauses free projects after a week of no activity. Here's the small GitHub Actions workflow I built to keep mine running, for free, forever."
tags: ["supabase", "github-actions", "ci-cd", "devops"]
---

If you've ever left a side project on Supabase's free tier for more than a week, you've probably seen this: you open your app, and every request fails. Not because you shipped a bug — because Supabase quietly **paused your project**.

## The problem

Supabase's free tier pauses a project after about **7 days with no API activity**. It's a completely reasonable policy for them — they can't keep thousands of abandoned hobby databases running forever for free. But it's annoying when:

- You're actively building something, just not touching the DB every single day
- A recruiter or a friend finally clicks the link to your side project, and it's dead
- You forgot the project existed until Supabase emails you that it's paused

Manually clicking "Restore" every week works, but it doesn't scale, and it's the kind of chore I always forget.

## The fix: a scheduled "keep-alive" ping

The actual fix is small: run a tiny job on a schedule that hits the project just often enough that Supabase never sees 7 days of silence. GitHub Actions already gives you free scheduled jobs (`cron` triggers) for any public repo, so there's no new infrastructure to stand up.

Here's the workflow, sitting at `.github/workflows/supabase-keep-alive.yml`:

```yaml
name: Supabase Keep-Alive

on:
  schedule:
    # Every 3 days — comfortably inside the 7-day pause window
    - cron: "0 0 */3 * *"
  workflow_dispatch: # lets me trigger it manually to test

jobs:
  ping:
    runs-on: ubuntu-latest
    steps:
      - name: Ping Supabase REST endpoint
        run: |
          curl -s -o /dev/null -w "%{http_code}" \
            "${{ secrets.SUPABASE_URL }}/rest/v1/${{ secrets.SUPABASE_KEEPALIVE_TABLE }}?select=id&limit=1" \
            -H "apikey: ${{ secrets.SUPABASE_ANON_KEY }}" \
            -H "Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}"
```

A few details that matter here:

- **Every 3 days, not every 6.** GitHub's cron scheduler isn't precision timing — on a busy day, jobs can be delayed by 10–20 minutes, occasionally more. Cutting it that close to a 7-day cutoff eventually bites you. Running every 3 days gives a wide safety margin.
- **`workflow_dispatch`** lets me trigger the job by hand from the Actions tab, so I can confirm it actually works instead of waiting 3 days to find out.
- **Secrets, not hardcoded URLs/keys.** `SUPABASE_URL` and `SUPABASE_ANON_KEY` live in the repo's GitHub Actions secrets, not in the workflow file.
- **A real query, not just a ping to the base URL.** Hitting the REST endpoint for an actual table (with `limit=1`) makes sure it's counted as genuine API activity, not just a network request that never reaches Supabase's query layer.

## Why not just use `pg_cron` inside Supabase?

Supabase does offer `pg_cron` as an extension for running scheduled jobs *inside* the database. But that doesn't help here — if the project is paused, nothing running inside it (including its own scheduled jobs) gets to execute. The keep-alive ping has to come from *outside* the project, which is exactly what GitHub Actions is good for.

## Result

Zero cost, zero maintenance. The workflow runs quietly every 3 days, Supabase sees it as activity, and the project never pauses. I don't think about it anymore — which is really the whole point of automating something like this.

If you're running any side project on Supabase's free tier and don't want to babysit it, this is maybe 10 minutes of setup for a problem you'll otherwise keep hitting forever.
