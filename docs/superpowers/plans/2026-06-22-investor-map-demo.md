# Investor Map Demo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone investor-facing Beijing route map demo page.

**Architecture:** Replace the existing `pages/route-map.html` with a self-contained static demo using HTML, CSS, SVG, and inline JavaScript route data. Add a navbar entry so the page is discoverable from the app.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript, existing Agency theme CSS.

---

### Task 1: Route Map Demo Page

**Files:**
- Modify: `pages/route-map.html`
- Modify: `components/header.html`

- [ ] **Step 1: Replace `pages/route-map.html` with the static investor demo**

Use a self-contained page with fixed Beijing route data, a stylized map board, route polyline, numbered stop markers, floating guide cards, side itinerary, and bottom explanation. Keep existing app header/sidebar loaders.

- [ ] **Step 2: Add navbar entry**

Add a `路线地图` link pointing to `./route-map.html` in `components/header.html`, between `路线推荐` and `行程安排`.

- [ ] **Step 3: Manual browser verification**

Run a static server from the repo root:

```powershell
node -e "const http=require('http'),fs=require('fs'),path=require('path');const root=process.cwd();const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8'};http.createServer((req,res)=>{let p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);if(p==='/'||p==='')p='/index.html';const f=path.normalize(path.join(root,p));if(!f.startsWith(root)){res.writeHead(403);return res.end('Forbidden')}fs.stat(f,(e,s)=>{if(e||!s.isFile()){res.writeHead(404);return res.end('Not Found')}res.writeHead(200,{'Content-Type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(res)})}).listen(8082,'127.0.0.1',()=>console.log('http://localhost:8082/pages/route-map.html'))"
```

Open `http://localhost:8082/pages/route-map.html`.

Expected:
- The page loads without external map API keys.
- Six Beijing stops are visible.
- The route line, stats cards, guide cards, itinerary panel, and bottom explanation are visible.
- Clicking `生成北京路线Demo` replays the visible route animation/state.
