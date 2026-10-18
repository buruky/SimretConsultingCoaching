# BK Web Studios footer credit
 
Copy-paste snippet for client sites. Replace `CLIENT NAME` and you're done. The year updates itself.
 
---
 
## 1. Head (inside `<head>`)
 
```html
<meta name="author" content="BK Web Studios">
<!-- Designed and developed by BK Web Studios · burukyimesgen.com -->
```
 
---
 
## 2. Footer: inline style (copyright left, credit right)
 
Best for light footers and wider layouts. Wraps to two lines on mobile.
 
```html
<footer class="bkws-footer bkws-inline">
  <span class="bkws-copy">© <span class="bkws-year">2026</span> CLIENT NAME. All rights reserved.</span>
  <span class="bkws-credit">Site by <a href="https://burukyimesgen.com" target="_blank" rel="noopener nofollow">BK Web Studios</a></span>
</footer>
```
 
## 2 (alt). Footer: stacked style (centered)
 
Best for dark footers or simple one-column sites.
 
```html
<footer class="bkws-footer bkws-stacked">
  <span class="bkws-copy">© <span class="bkws-year">2026</span> CLIENT NAME. All rights reserved.</span>
  <span class="bkws-credit">Site by <a href="https://burukyimesgen.com" target="_blank" rel="noopener nofollow">BK Web Studios</a></span>
</footer>
```
 
---
 
## 3. CSS (in your stylesheet or a `<style>` tag)
 
Colors inherit from the footer, so it works on light or dark backgrounds. Set `color` and `background` on `.bkws-footer` to match the site.
 
```css
.bkws-footer {
  display: flex;
  gap: 0.5rem 1.5rem;
  padding: 1.25rem 1.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
}
.bkws-inline  { justify-content: space-between; align-items: center; flex-wrap: wrap; }
.bkws-stacked { flex-direction: column; align-items: center; text-align: center; }
.bkws-credit  { font-size: 0.8em; opacity: 0.7; transition: opacity 0.2s; }
.bkws-credit:hover { opacity: 1; }
.bkws-credit a { color: inherit; text-decoration: underline; text-underline-offset: 2px; }
```
 
---
 
## 4. Auto year (before `</body>`)
 
```html
<script>
  document.querySelectorAll('.bkws-year').forEach(el => el.textContent = new Date().getFullYear());
</script>
```
 
---
 
## Checklist per client
 
- [ ] Replace `CLIENT NAME`
- [ ] Pick inline or stacked
- [ ] Set footer `color` / `background` to match the site
- [ ] Contract includes the footer credit clause
- [ ] If the domain changes, update the URL in the footer and the head comment
 