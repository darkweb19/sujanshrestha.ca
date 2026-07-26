---
title: "Your reverse proxy is an SSRF cannon by default"
date: "2026-07-26"
description: "Every reverse proxy tutorial resolves the upstream address from the Host header. That single line is the vulnerability. Here are the three layers I ended up needing to make preview URLs safe."
tags: ["security", "ssrf", "node", "reverse-proxy", "typescript"]
---

Every reverse proxy tutorial I read while building preview URLs had the same shape. Take the subdomain off the Host header, turn it into an upstream address, forward the request. It works on the first try, which is the problem, because what you just built is a machine that dials any address an attacker types into their browser's address bar.

## The problem

I'm building [Outpost](https://github.com/darkweb19/outpost), a thing that runs Claude Code inside disposable cloud sandboxes. You spin up a sandbox, an agent works in it, and when it starts a dev server on port 5173 you want to actually look at the page. So the sandbox needs a public URL, something like `my-sandbox-5173.preview.example.com`, that lands on a private port inside a machine that has no public IP of its own.

That means a reverse proxy sitting in front of the sandbox fleet. And the obvious implementation, the one in every blog post, is this:

```ts
// DO NOT DO THIS
const [name, port] = req.headers.host.split(".")[0].split("-");
http.request({ hostname: `${name}.internal`, port: Number(port) }, ...);
```

The Host header is attacker controlled. It is just a string the client sends. Nothing about it is verified by the time it reaches your code. So if I derive a dial target from it, I've handed the internet a request-forwarding primitive that runs from inside my private network, with my network's trust.

The classic payoff is `169.254.169.254`, the cloud metadata endpoint, which happily returns instance credentials to anything on the box that asks. But it's broader than that. My own database sits on a private hostname. So does the telemetry collector. So does the terminal daemon on port 8022, which is the single most sensitive port in the whole product. A proxy that builds its target from user input can reach all of them.

The uncomfortable part is that none of this shows up in testing. The happy path works perfectly. You only find out when someone else does.

## The fix

What actually fixed it was giving up on validating the Host header, and instead never letting it become an address at all. Three independent layers, each of which assumes the previous one failed.

**Layer one: parse the host into a lookup key, not an address.** The parser is a pure function with no imports of the database, the HTTP server, or anything that does I/O. All it can produce is a name and a port number:

```ts
const LABEL_RE = /^([a-z][a-z0-9-]*)-(\d{2,5})$/;

export function parsePreviewHost(host: string, previewDomain: string) {
  // ... strip an optional :port, lowercase
  const suffix = `.${previewDomain.toLowerCase()}`;
  if (!hostname.endsWith(suffix)) return null;

  const label = hostname.slice(0, hostname.length - suffix.length);
  if (label.length === 0 || label.includes(".")) return null;

  const m = LABEL_RE.exec(label);
  if (!m) return null;
  return { name: m[1], port: Number(m[2]) };
}
```

The name is then used to look up a row in my own database, and the address comes from that row. The Host header selects a record. It never constructs a destination. That's the whole trick, and it's most of the security.

Two details in there that took a second pass. The suffix check is an exact match against the full remaining label, so `evil.preview.example.com.attacker.net` fails instead of sneaking through a naive `endsWith`. And the name must start with a letter, so a label like `8022-8022` can't be read as a bare port pointing somewhere I didn't intend.

**Layer two: assert the resolved target's shape before dialing.** Even with the address coming from the database, I want the dial itself to refuse anything that isn't internal. A bad migration or a bug in the resolver shouldn't turn into a network capability:

```ts
export function assertTargetShape(hostname: string): void {
  const h = hostname.toLowerCase();
  if (/^[a-z0-9-]+\.vm\.[a-z0-9-]+\.internal$/.test(h)) return;
  if (isPrivateIpv4(h)) return;
  throw new Error(`proxy: refusing to dial non-internal target '${hostname}'`);
}
```

Allowlist, not denylist. Fly's internal DNS shape, or an RFC 1918 address. Everything else throws, including localhost, which is deliberate. A proxy that can reach `127.0.0.1` can reach my own admin routes with a loopback source address.

**Layer three: a DNS lookup hook that checks the resolved IP at connect time.** This is the one I nearly skipped, and it's the one that closes DNS rebinding. Layers one and two both validate a *name*. But a name I've allowed can resolve to whatever its owner wants, and can change its answer between the check and the connection. So the last guard runs on the actual IP, at the moment the socket is opened:

```ts
export function createGuardedLookup(baseLookup = dnsLookup): LookupFunction {
  return (hostname, options, callback) => {
    baseLookup(hostname, options, (err, address, family) => {
      if (err) return callback(err, address, family);
      try {
        assertResolvedTargetAddress(address); // private ranges only
        callback(null, address, family);
      } catch (cause) {
        const denied = new Error("DNS resolved outside the private network", { cause });
        denied.code = "EACCES";
        callback(denied, "", family);
      }
    });
  };
}
```

Node lets you pass a custom `lookup` to `http.request`, so this hooks in with one option. Every dial the proxy makes, HTTP and WebSocket both, goes through it. Public address, no connection, no exception path.

## Why it works, and the lesson

Each layer fails differently. Layer one is about parsing, layer two about the resolved name, layer three about the actual packet destination. To get a request out to the public internet you'd need to break all three, and they don't share an assumption, so a mistake in one doesn't quietly disarm the others.

The lesson I'd actually keep, though, is the shift underneath it: **stop trying to sanitize untrusted input into a safe address, and demote it into a lookup key instead.** Validation is a filter you're betting your network on, and filters lose to encodings, to redirects, to rebinding, to whatever's on Hacker News next month. A lookup is different in kind. The set of things the attacker can reach is the set of rows in my table, and that's true no matter how clever the input is.

The same reframe works past proxies. Webhook URLs, image-fetch-by-URL endpoints, "import from link" features, anything where your server takes an address from a user and connects to it. If you can turn that address into an ID that indexes something you control, do that instead. If you genuinely can't, you're now in the business of writing an SSRF filter, and you should know that's what you signed up for.

One more thing worth saying out loud: I found this because the security pass ran on the diff before it merged, not because anything broke. Nothing was going to break. That's exactly the category of bug that ships.
