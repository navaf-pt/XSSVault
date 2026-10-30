/**
 * Shared HTML shell for every lab target page.
 *
 * Each lab is a deliberately vulnerable mini-app. It renders inside a sandboxed
 * iframe (allow-scripts only, no allow-same-origin), so payloads run in an opaque
 * origin and cannot touch the portal, its storage, or any real session.
 *
 * The shim below gives sandboxed pages a *simulated* cookie jar, because a
 * document with an opaque origin cannot read document.cookie. That keeps the
 * classic "steal document.cookie" lessons working without ever issuing a real
 * credential. Hits are reported to the portal over postMessage, and exfiltrated
 * data is sent to the site's own /api/attack endpoint (never a third party).
 */

export const LAB_CSS = `
:root{--bg:#f4f6f9;--panel:#fff;--ink:#0f172a;--muted:#64748b;--line:#e2e8f0;--brand:#2563eb;--brand-2:#1d4ed8;--danger:#dc2626;--ok:#059669}
*{box-sizing:border-box}
html,body{margin:0}
body{font:14.5px/1.55 system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:var(--ink);background:var(--bg);min-height:100vh}
a{color:var(--brand);text-decoration:none}
a:hover{text-decoration:underline}
.lab-strip{background:#0f172a;color:#94a3b8;font:600 10px/1 ui-monospace,Menlo,monospace;letter-spacing:.14em;text-transform:uppercase;padding:5px 12px}
.appbar{display:flex;align-items:center;gap:10px;padding:11px 16px;background:var(--panel);border-bottom:1px solid var(--line)}
.appbar .logo{width:24px;height:24px;border-radius:7px;background:var(--brand);color:#fff;display:grid;place-items:center;font:700 12px/1 system-ui;flex:0 0 auto}
.appbar strong{font-size:14px;letter-spacing:-.01em}
.appbar .spacer{flex:1}
.appbar .who{font:600 11px/1 ui-monospace,monospace;color:var(--muted);background:#f1f5f9;border:1px solid var(--line);padding:5px 8px;border-radius:999px}
.appbar .who.admin{color:#7c2d12;background:#ffedd5;border-color:#fed7aa}
.lab-main{padding:18px 16px 34px;max-width:760px;margin:0 auto}
.lab-main.wide{max-width:100%}
h1{font-size:19px;margin:0 0 4px;letter-spacing:-.02em}
h2{font-size:15px;margin:22px 0 8px;letter-spacing:-.01em}
p{margin:8px 0}
.muted{color:var(--muted)}
.small{font-size:12.5px}
.card{background:var(--panel);border:1px solid var(--line);border-radius:12px;padding:14px}
.stack>*+*{margin-top:12px}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
input[type=text],input[type=email],input[type=search],textarea,select{width:100%;padding:9px 11px;border:1px solid #cbd5e1;border-radius:9px;font:inherit;background:#fff;color:inherit}
input:focus,textarea:focus{outline:2px solid #bfdbfe;border-color:#93c5fd}
textarea{min-height:78px;resize:vertical;font-family:ui-monospace,Menlo,monospace;font-size:13px}
button,.btn{display:inline-flex;align-items:center;gap:6px;padding:9px 14px;border-radius:9px;border:1px solid transparent;background:var(--brand);color:#fff;font:600 13px/1 inherit;cursor:pointer}
button:hover{background:var(--brand-2)}
button.ghost,.btn.ghost{background:#fff;color:#334155;border-color:#cbd5e1}
button.ghost:hover{background:#f8fafc}
button.tiny{padding:5px 9px;font-size:11.5px;border-radius:7px}
label{display:block;font:600 12px/1 inherit;margin-bottom:6px;color:#334155}
pre{margin:0;background:#0f172a;color:#e2e8f0;border-radius:10px;padding:11px 12px;overflow:auto;font:12.5px/1.6 ui-monospace,Menlo,monospace}
code{font:.94em ui-monospace,Menlo,monospace;background:#eef2f7;padding:1px 4px;border-radius:4px}
pre code{background:none;padding:0;color:inherit}
table{width:100%;border-collapse:collapse;font-size:13px}
th,td{text-align:left;padding:8px 10px;border-bottom:1px solid var(--line);vertical-align:top}
th{font:600 11px/1.4 ui-monospace,monospace;text-transform:uppercase;letter-spacing:.08em;color:var(--muted)}
.list{display:flex;flex-direction:column;gap:9px}
.item{background:#fff;border:1px solid var(--line);border-radius:10px;padding:10px 12px}
.item .meta{font:600 10.5px/1 ui-monospace,monospace;color:var(--muted);text-transform:uppercase;letter-spacing:.08em;margin-bottom:5px}
.banner{border-radius:10px;padding:10px 12px;font-size:13px;border:1px solid}
.banner.warn{background:#fffbeb;border-color:#fde68a;color:#92400e}
.banner.bad{background:#fef2f2;border-color:#fecaca;color:#991b1b}
.banner.ok{background:#ecfdf5;border-color:#a7f3d0;color:#065f46}
.banner.info{background:#eff6ff;border-color:#bfdbfe;color:#1e40af}
#__lab_toast{position:fixed;z-index:2147483647;right:12px;bottom:12px;left:12px;max-width:420px;margin-left:auto;background:#0f172a;color:#e2e8f0;border:1px solid #334155;border-radius:12px;padding:12px 14px;box-shadow:0 18px 40px rgba(2,6,23,.42);font:500 13px/1.5 system-ui,sans-serif}
#__lab_toast .t{display:flex;align-items:center;gap:7px;font:700 10px/1 ui-monospace,monospace;letter-spacing:.14em;text-transform:uppercase;color:#6ee7a8;margin-bottom:6px}
#__lab_toast .m{font:600 13px/1.45 ui-monospace,Menlo,monospace;word-break:break-word;white-space:pre-wrap}
.nav-pills{display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px}
.nav-pills a{font:600 12px/1 inherit;padding:7px 10px;border-radius:999px;background:#eef2f7;color:#334155}
.nav-pills a.on{background:#0f172a;color:#fff}
.empty{color:var(--muted);font-size:13px;padding:10px;text-align:center;border:1px dashed #cbd5e1;border-radius:10px}
`;

export const shimSource = (id, cookie) => `(function(){
var LAB=${JSON.stringify(id)};
var SEED=${JSON.stringify(cookie || '')};
var JAR={};
(SEED?SEED.split('; '):[]).forEach(function(p){var i=p.indexOf('=');if(i>0)JAR[p.slice(0,i)]=p.slice(i+1);});
try{Object.defineProperty(Document.prototype,'cookie',{configurable:true,get:function(){return Object.keys(JAR).map(function(k){return k+'='+JAR[k]}).join('; ')},set:function(v){var p=String(v).split(';')[0],i=p.indexOf('=');if(i>0)JAR[p.slice(0,i).trim()]=p.slice(i+1).trim()}})}catch(e){}
try{Object.defineProperty(document,'domain',{configurable:true,get:function(){return location.hostname||'lab.local'}})}catch(e){}
function emit(kind,extra){try{parent.postMessage(Object.assign({type:'lab-event',lab:LAB,kind:kind},extra||{}),'*')}catch(e){}}
window.__labEmit=emit;
window.__labSolved=function(how){emit('solved',{how:String(how||'script executed')})};
function toast(msg){
  var d=document.getElementById('__lab_toast');
  if(!d){d=document.createElement('div');d.id='__lab_toast';(document.body||document.documentElement).appendChild(d);}
  d.innerHTML='<div class="t">XSS executed in lab</div>';
  var m=document.createElement('div');m.className='m';m.textContent=msg;d.appendChild(m);
  clearTimeout(d.__h);d.__h=setTimeout(function(){d.remove()},6000);
}
window.alert=function(m){var text=(m===undefined||m==='')?'alert() fired — sandboxed origin returned an empty document.domain':String(m);emit('alert',{message:text});toast(text)};
window.confirm=function(m){emit('alert',{message:'confirm → '+String(m)});toast('confirm → '+String(m));return true};
window.prompt=function(m){emit('alert',{message:'prompt → '+String(m)});return ''};
})();`;

/**
 * Wraps lab markup in the shared shell.
 * @param {{id:string, app:string, title:string, body:string, cookie?:string,
 *          head?:string, headerExtra?:string, who?:string, wide?:boolean}} o
 */
export function labPage(o) {
  const who = o.who
    ? `<span class="who ${o.who.indexOf('admin') === 0 ? 'admin' : ''}">${o.who}</span>`
    : '';
  return `<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${esc(o.title)}</title>
<style>${LAB_CSS}</style>
<script src="/lab/_shim.js?id=${encodeURIComponent(o.id)}&ck=${encodeURIComponent(o.cookie || '')}"></script>
${o.head || ''}
</head><body>
<div class="lab-strip">lab target · intentionally vulnerable · sandboxed</div>
<div class="appbar"><span class="logo">${esc((o.app || 'A')[0].toUpperCase())}</span><strong>${esc(o.app)}</strong><span class="spacer"></span>${who}${o.headerExtra || ''}</div>
<main class="lab-main${o.wide ? ' wide' : ''}">${o.body}</main>
</body></html>`;
}

export function htmlResponse(html, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('content-type', 'text/html; charset=utf-8');
  headers.set('cache-control', 'no-store');
  headers.set('referrer-policy', 'same-origin');
  return new Response(html, { status: init.status || 200, headers });
}

export function jsonResponse(data, init = {}) {
  const headers = new Headers(init.headers || {});
  headers.set('content-type', 'application/json; charset=utf-8');
  headers.set('cache-control', 'no-store');
  return new Response(JSON.stringify(data), { status: init.status || 200, headers });
}

export function redirect(location) {
  return new Response(null, { status: 303, headers: { location, 'cache-control': 'no-store' } });
}

/** Correct escaping helpers. Used everywhere except at the intentional sink. */
export function esc(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/* ------------------------------------------------------------------ *
 * Intentionally broken "filters" used by the bypass labs. These exist
 * to be defeated; they are never used to protect the portal itself.
 * ------------------------------------------------------------------ */

export const filters = {
  /** Removes complete <script>...</script> blocks, then stray <script> tags. */
  stripScriptTags(v) {
    return String(v).replace(/<script[\s\S]*?<\/script\s*>/gi, '').replace(/<\/?script[^>]*>/gi, '');
  },
  /** Removes every on* handler and javascript: URL — but only once, no recursion. */
  stripHandlersOnce(v) {
    return String(v)
      .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
      .replace(/javascript:/gi, '');
  },
  /** HTML-entity-encodes angle brackets and quotes (correct for HTML text/attr). */
  entityEncode(v) {
    return esc(v);
  },
  /** Encodes only < and > — a classic partial-encoding bug. */
  encodeAnglesOnly(v) {
    return String(v).replace(/</g, '&lt;').replace(/>/g, '&gt;');
  },
};
