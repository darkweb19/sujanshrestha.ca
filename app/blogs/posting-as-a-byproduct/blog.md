---
title: "I Never Post About What I Build. So I Made Posting a Byproduct of My Notes."
date: "2026-07-11"
description: "I build something almost every week and post about it almost never. Here's the small system that turned writing a blog and a LinkedIn post from a cold-start chore into an edit."
tags: ["build-in-public", "claude-code", "obsidian", "workflow", "automation"]
---

I build something almost every week. I post about it almost never.

Not because I don't want to. Because "write a blog and a LinkedIn post" is its own task, and it always lost to the next thing I wanted to build.

## The problem

I already keep detailed notes while I work. Every day, what I built, what broke, what I decided, it all goes into my vault as it happens. The raw material for a post is sitting right there.

But turning that into something published meant sitting down with a blank page, remembering what happened three days ago, drafting a full blog, then rewriting it short for LinkedIn. That's a context switch and a cold start, every single time. And a cold start always loses to momentum. So the posting just never happened.

For a long time I filed this under discipline. I need to be more consistent, I'd tell myself, as if the fix was wanting it more. That framing never worked, because it was wrong. Consistency in public isn't a willpower problem. It's a friction problem. The friction was the blank page.

## The fix: make the post fall out of the notes

The insight was small. I already do the hard part, which is the building and the note-taking. What I was missing was the last mile. So I moved posting to where I already had momentum instead of treating it as a separate discipline.

Two pieces.

**A daily flag.** Every day my notes now carry a tiny field. Was today worth posting about, true or false. When I get stuck on something and dig my way out, and it's the kind of wall other people hit too, I mark it true with a one-line note:

```md
## Post-worthy?
worth_posting: true
- stuck: the wall I hit
- fix: how I got past it
- angle: why everyone hits this
```

It takes ten seconds because I'm already writing the note. The judgment happens while the memory is warm, not on some future posting day when I'm trying to reconstruct what mattered.

**A weekly command.** Once a week I run one command. It reads the week's notes, finds the flagged moments, picks the single most relatable one, and drafts both pieces for me: an in-depth blog and a short post. It pulls the real details from the actual repo, not my memory, so the draft is grounded in what really happened.

The whole thing runs on notes I was keeping anyway, wired together with Claude Code.

## The one rule that makes it work

The filter isn't "did something happen today." It's "is this a wall other people hit too."

That distinction is everything. A niche bug in my own code is a diary entry. Nobody needs it. But "I trusted the order of an array coming back from an API and it silently misaligned my data" is a wall a thousand other people have hit, and the fix is worth two minutes of a stranger's time. The daily flag forces that judgment in the moment, while it's fresh, which is exactly when I can tell the difference.

If it's not relatable and it's not something you could imagine someone searching for, it doesn't get the flag. Most days are false, and that's fine. The point is to catch the few that are genuinely worth telling.

## Why it works

- The cost is paid in ten-second daily increments instead of one weekly hour I never actually had.
- The judgment happens while the memory is warm, so the angle is sharp.
- The draft is built from real work, so it can't drift into generic advice.
- Writing became editing. I'm never starting from a blank page. I'm reacting to a draft that's already most of the way there.

The lesson I keep relearning: if you keep skipping something that matters, don't try to add willpower. Look at where the friction actually is and move the work to where you already have momentum. For me the momentum lives in my notes, so that's where posting had to live too.

This post is the first thing that fell out of the system. Fittingly, the wall it's about is the exact one that kept me from writing posts like this for so long.
