var ee=`
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
`,q=(e,t)=>`(function(){
var LAB=${JSON.stringify(e)};
var SEED=${JSON.stringify(t||"")};
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
window.alert=function(m){var text=(m===undefined||m==='')?'alert() fired \u2014 sandboxed origin returned an empty document.domain':String(m);emit('alert',{message:text});toast(text)};
window.confirm=function(m){emit('alert',{message:'confirm \u2192 '+String(m)});toast('confirm \u2192 '+String(m));return true};
window.prompt=function(m){emit('alert',{message:'prompt \u2192 '+String(m)});return ''};
})();`;function i(e){let t=e.who?`<span class="who ${e.who.indexOf("admin")===0?"admin":""}">${e.who}</span>`:"";return`<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${d(e.title)}</title>
<style>${ee}</style>
<script src="/lab/_shim.js?id=${encodeURIComponent(e.id)}&ck=${encodeURIComponent(e.cookie||"")}"><\/script>
${e.head||""}
</head><body>
<div class="lab-strip">lab target \xB7 intentionally vulnerable \xB7 sandboxed</div>
<div class="appbar"><span class="logo">${d((e.app||"A")[0].toUpperCase())}</span><strong>${d(e.app)}</strong><span class="spacer"></span>${t}${e.headerExtra||""}</div>
<main class="lab-main${e.wide?" wide":""}">${e.body}</main>
</body></html>`}function x(e,t={}){let a=new Headers(t.headers||{});return a.set("content-type","text/html; charset=utf-8"),a.set("cache-control","no-store"),a.set("referrer-policy","same-origin"),new Response(e,{status:t.status||200,headers:a})}function f(e,t={}){let a=new Headers(t.headers||{});return a.set("content-type","application/json; charset=utf-8"),a.set("cache-control","no-store"),new Response(JSON.stringify(e),{status:t.status||200,headers:a})}function u(e){return new Response(null,{status:303,headers:{location:e,"cache-control":"no-store"}})}function d(e){return String(e??"").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;").replace(/'/g,"&#39;")}var _={stripScriptTags(e){return String(e).replace(/<script[\s\S]*?<\/script\s*>/gi,"").replace(/<\/?script[^>]*>/gi,"")},stripHandlersOnce(e){return String(e).replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,"").replace(/javascript:/gi,"")},entityEncode(e){return d(e)},encodeAnglesOnly(e){return String(e).replace(/</g,"&lt;").replace(/>/g,"&gt;")}};var y={entries:[],settings:new Map,seq:1},D=!1;async function A(e){return!e||!e.DB?!1:(D||(await e.DB.batch([e.DB.prepare(`CREATE TABLE IF NOT EXISTS entries (
         id INTEGER PRIMARY KEY AUTOINCREMENT,
         lab TEXT NOT NULL,
         kind TEXT NOT NULL,
         data TEXT NOT NULL,
         created_at INTEGER NOT NULL
       )`),e.DB.prepare("CREATE INDEX IF NOT EXISTS entries_lab ON entries (lab, kind)"),e.DB.prepare("CREATE TABLE IF NOT EXISTS settings (key TEXT PRIMARY KEY, value TEXT NOT NULL)")]),D=!0),!0)}async function b(e,{lab:t,kind:a="row",data:o={},createdAt:s}){let n=JSON.stringify(o),l=s||Date.now();if(await A(e)){await e.DB.prepare("INSERT INTO entries (lab, kind, data, created_at) VALUES (?, ?, ?, ?)").bind(t,a,n,l).run();return}y.entries.push({id:y.seq++,lab:t,kind:a,data:n,created_at:l})}async function p(e,{lab:t,kind:a="row",limit:o=50}){if(await A(e)){let{results:s}=await e.DB.prepare("SELECT id, data, created_at FROM entries WHERE lab = ? AND kind = ? ORDER BY id DESC LIMIT ?").bind(t,a,o).all();return(s||[]).map(n=>({id:n.id,createdAt:n.created_at,data:Y(n.data)}))}return y.entries.filter(s=>s.lab===t&&s.kind===a).sort((s,n)=>n.id-s.id).slice(0,o).map(s=>({id:s.id,createdAt:s.created_at,data:Y(s.data)}))}async function M(e,t){if(await A(e)){await e.DB.batch([e.DB.prepare("DELETE FROM entries WHERE lab = ?").bind(t),e.DB.prepare("DELETE FROM settings WHERE key LIKE ?").bind(t+":%")]);return}y.entries=y.entries.filter(a=>a.lab!==t);for(let a of[...y.settings.keys()])a.startsWith(t+":")&&y.settings.delete(a)}async function T(e,t,a){let o=String(a);if(await A(e)){await e.DB.prepare("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value").bind(t,o).run();return}y.settings.set(t,o)}async function N(e,t,a=null){if(await A(e)){let o=await e.DB.prepare("SELECT value FROM settings WHERE key = ?").bind(t).first();return o?o.value:a}return y.settings.has(t)?y.settings.get(t):a}function Y(e){try{return JSON.parse(e)}catch{return{value:String(e)}}}var S="session=usr_5f2c91d7; theme=leaf";function $(e,t,a=""){return`<form method="get" action="/lab/${e}" class="row" style="margin-bottom:14px">
      <input type="search" name="q" placeholder="Search\u2026" value="${d(t)}" style="flex:1" />
      <button type="submit">Search</button>
    </form>${a}`}var H={"reflected-html":{handle({url:e}){let t=e.searchParams.get("q")||"",a=`
        <h1>Nimbus knowledge base</h1>
        <p class="muted small">Search help articles, or browse the top questions below.</p>
        ${$("reflected-html",t)}
        ${t?`<div class="card">
                 <!-- INTENTIONAL VULNERABILITY: q is interpolated into HTML text unencoded -->
                 <h2 style="margin:0">Results for ${t}</h2>
                 <p class="muted small" style="margin-bottom:0">3 articles matched your query.</p>
               </div>
               <div class="list" style="margin-top:12px">
                 <div class="item"><div class="meta">Article</div>Resetting your API key</div>
                 <div class="item"><div class="meta">Article</div>Inviting teammates to a workspace</div>
                 <div class="item"><div class="meta">Article</div>Understanding billing periods</div>
               </div>`:'<div class="empty">Type a query to search the knowledge base.</div>'}`;return i({id:"reflected-html",app:"Nimbus Support",title:"Knowledge base",cookie:S,body:a})}},"reflected-attribute":{handle({url:e}){let t=e.searchParams.get("q")||"",o=`
        <h1>Product search</h1>
        <p class="muted small">We remember your last search so you can refine it.</p>
        <form method="get" action="/lab/reflected-attribute" class="stack">
          <!-- INTENTIONAL VULNERABILITY: value attribute built by concatenation; only < and > are filtered -->
          <input class="q" type="text" name="q" value="${_.encodeAnglesOnly(t)}" placeholder="Search products\u2026" />
          <button type="submit">Search</button>
        </form>
        <p class="small muted" style="margin-top:14px">Filter in use: <code>&lt;</code> and <code>&gt;</code> are removed as entities. Quotes are passed through.</p>
        ${t?`<div class="list">${["Nimbus Desk Lamp \u2014 $49","Nimbus Notebook \u2014 $8","Nimbus Cable Kit \u2014 $19"].map(s=>`<div class="item">${d(s)}</div>`).join("")}</div>`:""}`;return i({id:"reflected-attribute",app:"Polygon Shop",title:"Product search",cookie:S,body:o})}},"reflected-unquoted":{handle({url:e}){let t=e.searchParams.get("q")||"",a=t.replace(/[<>"']/g,""),o=`
        <h1>Greenleaf store</h1>
        <p class="muted small">Search our spring collection.</p>
        ${$("reflected-unquoted",t)}
        ${t?`<p class="small muted">Preview chip (hover it):</p>
               <!-- INTENTIONAL VULNERABILITY: unquoted attribute value -->
               <div class="preview" data-q=${a} style="display:inline-block;background:#eef6ff;border:1px solid #bfdbfe;color:#1e3a8a;padding:9px 13px;border-radius:9px;font:600 13px/1 ui-monospace,monospace">\u201C${d(t)}\u201D</div>`:'<div class="empty">Search for something to preview it here.</div>'}
        <p class="small muted" style="margin-top:16px">Filter in use: <code>&lt;</code> <code>&gt;</code> <code>"</code> <code>'</code> are stripped.</p>`;return i({id:"reflected-unquoted",app:"Greenleaf Store",title:"Store search",cookie:S,body:o})}},"reflected-js-string":{handle({url:e}){let t=e.searchParams.get("q")||"",a=t.replace(/[<>]/g,""),o=`
        <h1>Search</h1>
        <p class="muted small">Results are rendered by a legacy inline widget.</p>
        ${$("reflected-js-string",t)}
        <div id="results"></div>
        <!-- INTENTIONAL VULNERABILITY: request data concatenated into JavaScript source -->
        <script>
          var q = '${a}';
          document.write('<div class="card">You searched for <b>' + q + '</b></div>');
        <\/script>
        <p class="small muted" style="margin-top:14px">Filter in use: <code>&lt;</code> and <code>&gt;</code> are stripped from the query.</p>`;return i({id:"reflected-js-string",app:"Nimbus Support",title:"Search",cookie:S,body:o})}},"reflected-href":{handle({url:e}){let t=e.searchParams.get("q")||"",a=/javascript:/i.test(t),o=`
        <h1>Greenleaf store</h1>
        <p class="muted small">Search results for your last query.</p>
        ${$("reflected-href","")}
        ${a?'<div class="banner bad">Blocked: the query contains a disallowed scheme.</div>':t?`<div class="card">
                   <p class="small muted" style="margin:0 0 6px">Refine your search:</p>
                   <!-- INTENTIONAL VULNERABILITY: query interpolated into href + a blocklist that only checks the raw string -->
                   <a id="refine" href="${t}">${d(t)}</a>
                 </div>
                 <div id="verdict" class="small" style="margin-top:10px"></div>
                 <p class="small muted" style="margin:8px 0 0">This range renders labs in a sandboxed frame, and Chrome blocks <code>javascript:</code> navigation there.
                 So the lab resolves the href for you and reports the scheme it parsed \u2014 that is the proof the blocklist was bypassed.</p>
                 <script>
                   (function () {
                     var a = document.getElementById('refine');
                     if (!a) return;
                     var resolved;
                     try { resolved = new URL(a.getAttribute('href'), location.href); } catch (e) { return; }
                     document.getElementById('verdict').innerHTML = 'Resolved scheme: <b>' + resolved.protocol + '</b>';
                     if (resolved.protocol === 'javascript:' && window.__labSolved) {
                       window.__labSolved('scheme blocklist bypassed: ' + resolved.protocol);
                     }
                   })();
                 <\/script>
                 <div class="list" style="margin-top:12px"><div class="item">Spring jacket \u2014 $89</div><div class="item">Canvas tote \u2014 $24</div></div>`:'<div class="empty">Run a search to get a refine link.</div>'}
        <p class="small muted" style="margin-top:16px">Filter in use: the raw query is rejected if it contains the literal text <code>javascript:</code>.</p>`;return i({id:"reflected-href",app:"Greenleaf Store",title:"Refine search",cookie:S,body:o})}},"reflected-json":{handle({url:e,segs:t}){let a=e.searchParams.get("q")||"";if(t[0]==="api")return f({q:a,total:3,items:["Reset your API key","Invite teammates","Billing periods"]},{headers:{"x-content-type-options":"nosniff","access-control-allow-origin":"*"}});let o=`
        <h1>Knowledge base</h1>
        <p class="muted small">Search is rendered client-side from the JSON API.</p>
        ${$("reflected-json",a)}
        <div id="out"></div>
        <p class="small muted" style="margin-top:16px">Transport: <code>/lab/reflected-json/api?q=\u2026</code> returns <code>application/json</code>. The page renders one field with <code>innerHTML</code>.</p>
        <script>
          (function () {
            var q = new URLSearchParams(location.search).get('q') || '';
            if (!q) return;
            fetch('/lab/reflected-json/api?q=' + encodeURIComponent(q))
              .then(function (r) { return r.json(); })
              .then(function (data) {
                var box = document.getElementById('out');
                // INTENTIONAL VULNERABILITY: JSON field written with an HTML sink
                box.innerHTML = '<div class="card"><h2 style="margin:0">Results for ' + data.q + '</h2>' +
                  '<p class="muted small" style="margin-bottom:0">' + data.total + ' articles matched.</p></div>';
              });
          })();
        <\/script>`;return i({id:"reflected-json",app:"Nimbus Support",title:"Knowledge base",cookie:S,body:o})}}};var I="session=usr_5f2c91d7; theme=leaf",V="session=adm_71be4f0c9a; role=admin";function G(e){let t=Math.max(1,Math.round((Date.now()-e)/1e3));return t<60?`${t}s ago`:t<3600?`${Math.round(t/60)}m ago`:`${Math.round(t/3600)}h ago`}var F={"stored-guestbook":{async handle({env:e,form:t,method:a}){if(a==="POST")return await b(e,{lab:"stored-guestbook",kind:"entry",data:{name:t.name||"anonymous",message:t.message||""}}),u("/lab/stored-guestbook?posted=1");let o=await p(e,{lab:"stored-guestbook",kind:"entry",limit:40}),s=o.length?o.map(l=>`<div class="item">
                <div class="meta">${d(l.data.name)} \xB7 ${G(l.createdAt)}</div>
                <!-- INTENTIONAL VULNERABILITY: stored message rendered as HTML -->
                <div class="msg">${l.data.message}</div>
              </div>`).join(""):'<div class="empty">No entries yet. Be the first to sign the guestbook.</div>',n=`
        <h1>PixelPress guestbook</h1>
        <p class="muted small">Leave a note for other readers. Entries appear immediately.</p>
        <form method="post" action="/lab/stored-guestbook" class="stack" style="margin-bottom:18px">
          <div><label for="n">Name</label><input id="n" type="text" name="name" placeholder="Your name" /></div>
          <div><label for="m">Message</label><textarea id="m" name="message" placeholder="Say something nice\u2026"></textarea></div>
          <button type="submit">Sign the guestbook</button>
        </form>
        <h2>Recent entries (${o.length})</h2>
        <div class="list">${s}</div>`;return i({id:"stored-guestbook",app:"PixelPress",title:"Guestbook",cookie:I,body:n})}},"stored-profile":{async handle({env:e,form:t,method:a,segs:o}){let s="stored-profile:bio";if(a==="POST")return await T(e,s,t.bio||""),u("/lab/stored-profile?saved=1");let n=await N(e,s,"")||"";if(o[0]==="admin"){let r=`
          <h1>Agent dashboard</h1>
          <p class="muted small">Signed in as <code>agent@nimbus.io</code> \xB7 opened from the support queue.</p>
          <div class="banner warn">This panel renders customer-supplied profile fields. Support agents open it for every ticket.</div>
          <div class="card" style="margin-top:12px">
            <div class="meta" style="font:600 10.5px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Customer profile</div>
            <p style="margin:4px 0"><b>Name:</b> Dana Whitfield</p>
            <p style="margin:4px 0"><b>Company:</b> Northwind Labs</p>
            <p style="margin:4px 0"><b>Plan:</b> Enterprise \xB7 214 seats</p>
            <p style="margin:4px 0"><b>Bio:</b></p>
            <!-- INTENTIONAL VULNERABILITY: stored bio rendered as HTML in a privileged view -->
            <div class="bio">${n||'<span class="muted">(empty)</span>'}</div>
          </div>
          <p class="small muted" style="margin-top:14px">Actions available to this agent: reset password, change plan, export invoices, delete workspace.</p>`;return i({id:"stored-profile",app:"Nimbus Support",title:"Agent dashboard",cookie:V,who:"admin@nimbus.io",body:r})}let l=`
        <h1>Your support profile</h1>
        <p class="muted small">Agents see these details when you open a ticket.</p>
        <form method="post" action="/lab/stored-profile" class="stack">
          <div><label for="b">Bio</label><textarea id="b" name="bio" placeholder="Tell support about your setup\u2026">${d(n)}</textarea></div>
          <button type="submit">Save profile</button>
        </form>
        <div class="card" style="margin-top:14px">
          <p class="small muted" style="margin:0">Your profile preview (escaped here \u2014 the agent dashboard is what matters):</p>
          <p style="margin:6px 0 0">${d(n)}</p>
        </div>`;return i({id:"stored-profile",app:"Nimbus Support",title:"Support profile",cookie:I,body:l})}},"stored-second-order":{async handle({env:e,form:t,method:a,segs:o}){let s="stored-second-order:name";if(a==="POST")return await T(e,s,t.name||""),u("/lab/stored-second-order?saved=1");let n=await N(e,s,"Dana Whitfield")||"Dana Whitfield";if(o[0]==="print"){let r=`
          <h1>Invoice #GRL-20418</h1>
          <p class="muted small">Printable view \xB7 generated from your stored account details.</p>
          <table style="margin-top:12px">
            <tr><th>Bill to</th>
              <!-- INTENTIONAL VULNERABILITY: same stored value, a second sink with no encoding -->
              <td>${n}</td>
            </tr>
            <tr><th>Issued</th><td>${new Date().toISOString().slice(0,10)}</td></tr>
            <tr><th>Item</th><td>Greenleaf subscription (annual)</td></tr>
            <tr><th>Total</th><td>$1,188.00</td></tr>
          </table>
          <p class="small muted" style="margin-top:16px"><a href="/lab/stored-second-order">\u2190 back to account</a></p>`;return i({id:"stored-second-order",app:"Greenleaf Store",title:"Invoice",cookie:I,body:r})}let l=`
        <h1>Account settings</h1>
        <p class="muted small">This page escapes everything. Other pages that use the same field may not.</p>
        <form method="post" action="/lab/stored-second-order" class="stack">
          <div><label for="nm">Account name</label><input id="nm" type="text" name="name" value="${d(n)}" /></div>
          <button type="submit">Save</button>
        </form>
        <div class="card" style="margin-top:14px">
          <p class="small muted" style="margin:0 0 4px">Name as rendered here (encoded):</p>
          <p style="margin:0"><b>${d(n)}</b></p>
        </div>
        <p style="margin-top:16px"><a href="/lab/stored-second-order/print">Print invoice \u2192</a></p>`;return i({id:"stored-second-order",app:"Greenleaf Store",title:"Account",cookie:I,body:l})}},"stored-filename":{async handle({env:e,form:t,method:a}){if(a==="POST"){let l=t.filename||"";return l&&await b(e,{lab:"stored-filename",kind:"file",data:{name:l,size:`${Math.floor(Math.random()*900+90)} KB`,owner:"you"}}),u("/lab/stored-filename?added=1")}let o=await p(e,{lab:"stored-filename",kind:"file",limit:30}),s=o.length?o.map(l=>`<div class="item doc-row" data-name="${d(l.data.name)}">
                <div class="meta">${d(l.data.owner)} \xB7 ${d(l.data.size)}</div>
                <!-- INTENTIONAL VULNERABILITY: filename concatenated into HTML -->
                <div class="fname">\u{1F4C4} ${l.data.name}</div>
              </div>`).join(""):'<div class="empty">No documents yet.</div>',n=`
        <h1>Nimbus Docs</h1>
        <p class="muted small">Team workspace \xB7 4 members. This demo records the filename only.</p>
        <form method="post" action="/lab/stored-filename" class="stack" style="margin-bottom:16px">
          <div><label for="f">Upload a document (filename)</label><input id="f" type="text" name="filename" placeholder="quarterly-report.pdf" /></div>
          <button type="submit">Upload</button>
        </form>
        <h2>Documents (${o.length})</h2>
        <div class="list" id="files">${s}</div>`;return i({id:"stored-filename",app:"Nimbus Docs",title:"Documents",cookie:I,body:n})}},"stored-log":{async handle({env:e,form:t,method:a,segs:o}){if(a==="POST")return await b(e,{lab:"stored-log",kind:"report",data:{subject:t.subject||"",message:t.message||"",status:"open"}}),u("/lab/stored-log?sent=1");let s=await p(e,{lab:"stored-log",kind:"report",limit:40});if(o[0]==="admin"){let c=`
          <h1>Support audit log</h1>
          <p class="muted small">Internal only \xB7 renders report bodies with HTML for formatting.</p>
          <div class="list">${s.length?s.map((m,h)=>`<div class="item">
                  <div class="meta">#${1e3+h} \xB7 ${G(m.createdAt)} \xB7 ${d(m.data.status)}</div>
                  <div><b>${d(m.data.subject)}</b></div>
                  <!-- INTENTIONAL VULNERABILITY: log body rendered as HTML for "formatting" -->
                  <div style="margin-top:4px">${m.data.message}</div>
                </div>`).join(""):'<div class="empty">No reports in the audit log.</div>'}</div>`;return i({id:"stored-log",app:"Nimbus Support",title:"Audit log",cookie:V,who:"support@nimbus.io",body:c})}let l=`
        <h1>Report a problem</h1>
        <p class="muted small">Your report goes to the support audit log. ${s.filter(r=>r.data.status==="open").length} open report(s).</p>
        <form method="post" action="/lab/stored-log" class="stack">
          <div><label for="s">Subject</label><input id="s" type="text" name="subject" placeholder="Short summary" /></div>
          <div><label for="m">Message</label><textarea id="m" name="message" placeholder="What went wrong?"></textarea></div>
          <button type="submit">Send report</button>
        </form>`;return i({id:"stored-log",app:"Nimbus Support",title:"Report a problem",cookie:I,body:l})}}};var v="session=usr_5f2c91d7; theme=pixel";function O(e,t,a){return`<form class="stack" style="margin-bottom:16px" onsubmit="event.preventDefault(); var v=this.t.value; location.hash = v; location.reload();">
      <div><label for="t">${d(t)}</label><input id="t" type="text" name="t" placeholder="${d(a)}" /></div>
      <button type="submit">Set fragment &amp; reload</button>
    </form>`}var z={"dom-document-write":{handle({url:e}){let t=`
        <h1>PixelPress search highlight</h1>
        <p class="muted small">The highlighted term comes from the URL fragment, so it never reaches the server.</p>
        ${O("dom-document-write","Search term (goes into the # fragment)","<img src=x onerror=alert(1)>")}
        <div id="out"></div>
        <p class="small muted" style="margin-top:16px">Server-side request log for this page: <code>GET /lab/dom-document-write</code> \u2014 no query, no fragment.</p>
        <!-- INTENTIONAL VULNERABILITY: document.write of location.hash -->
        <script>
          (function () {
            var term = decodeURIComponent((location.hash || '').slice(1));
            if (!term) return;
            document.write('<div class="card"><h2 style="margin:0">You searched for ' + term + '</h2>' +
              '<p class="muted small" style="margin-bottom:0">Highlighting matches in the archive\u2026</p></div>');
          })();
        <\/script>`;return i({id:"dom-document-write",app:"PixelPress",title:"Search highlight",cookie:v,body:t})}},"dom-innerhtml":{handle(){return i({id:"dom-innerhtml",app:"Greenleaf Store",title:"Welcome back",cookie:v,body:`
        <h1>Welcome back</h1>
        <p class="muted small">Greeting is rendered client-side from the query string.</p>
        <form class="stack" style="margin-bottom:16px" onsubmit="event.preventDefault(); location.search = '?name=' + encodeURIComponent(this.t.value);">
          <div><label for="t">Your name</label><input id="t" type="text" name="t" placeholder="returning shopper" /></div>
          <button type="submit">Set name</button>
        </form>
        <div class="card" id="banner">Hello, guest.</div>
        <!-- INTENTIONAL VULNERABILITY: innerHTML sink fed from URLSearchParams -->
        <script>
          (function () {
            var name = new URLSearchParams(location.search).get('name');
            if (!name) return;
            document.getElementById('banner').innerHTML = 'Welcome back, <b>' + name + '</b>';
          })();
        <\/script>`})}},"dom-eval":{handle(){let e=`
        <h1>Status page</h1>
        <p class="muted small">A leftover debugger: pass a snippet in the fragment to evaluate it.</p>
        <div class="banner info">Engineers used this to poke at the status widget from bookmarks. It shipped.</div>
        ${O("dom-eval","JavaScript to evaluate (no # needed)","alert(document.domain)")}
        <div class="card"><p class="small muted" style="margin:0">eval() output appears below.</p><pre id="out" style="margin-top:8px">\u2014</pre></div>
        <!-- INTENTIONAL VULNERABILITY: eval of location.hash -->
        <script>
          (function () {
            var code = decodeURIComponent((location.hash || '').slice(1));
            if (!code) return;
            var out = document.getElementById('out');
            try { out.textContent = String(eval(code)); }
            catch (e) { out.textContent = 'Error: ' + e.message; }
          })();
        <\/script>`;return i({id:"dom-eval",app:"Nimbus Support",title:"Status",cookie:v,body:e})}},"dom-settimeout":{handle(){let e=`
        <h1>Launch countdown</h1>
        <p class="muted small">The countdown setup code is passed to setTimeout as a string.</p>
        <div class="card" id="tick">waiting\u2026</div>
        ${O("dom-settimeout","Countdown setup code","alert(document.domain)")}
        <!-- INTENTIONAL VULNERABILITY: setTimeout called with a string -->
        <script>
          (function () {
            var code = decodeURIComponent((location.hash || '').slice(1));
            if (!code) return;
            setTimeout(code, 150);
          })();
        <\/script>`;return i({id:"dom-settimeout",app:"PixelPress",title:"Countdown",cookie:v,body:e})}},"dom-selector":{handle(){let e=`
        <h1>Anchor navigation</h1>
        <p class="muted small">The theme script runs <code>$(location.hash)</code> to scroll to a section.</p>
        ${O("dom-selector","Hash (without #)","<img src=x onerror=alert(1)>")}
        <div class="card" id="out"><p class="muted small" style="margin:0">Resolved nodes are appended here.</p></div>
        <!-- INTENTIONAL VULNERABILITY: jQuery-style $() treats strings starting with < as HTML -->
        <script>
          window.$ = function (arg) {
            if (typeof arg === 'string' && /^\\s*</.test(arg)) {
              var d = document.createElement('div');
              d.innerHTML = arg;            // parses attacker HTML
              return Array.prototype.slice.call(d.children);
            }
            try { return Array.prototype.slice.call(document.querySelectorAll(arg || '*')); }
            catch (e) { return []; }
          };
          (function () {
            var h = decodeURIComponent((location.hash || '').slice(1));
            if (!h) return;
            var out = document.getElementById('out');
            var nodes = $(h);
            nodes.forEach(function (n) { out.appendChild(n); });
          })();
        <\/script>`;return i({id:"dom-selector",app:"Greenleaf Store",title:"Navigation",cookie:v,body:e})}},"dom-postmessage":{handle({segs:e}){return e[0]==="widget"?i({id:"dom-postmessage",app:"Widget sandbox",title:"Chat widget",cookie:"",body:`
          <div class="card" style="margin-bottom:10px">
            <div class="meta" style="font:600 10px ui-monospace,monospace;letter-spacing:.1em;text-transform:uppercase;color:#64748b">Third-party widget</div>
            <h2 style="font-size:14px;margin:2px 0 8px">Message the chat window</h2>
            <form class="stack" onsubmit="event.preventDefault(); parent.postMessage(this.m.value, '*'); this.m.value='';">
              <input id="m" name="m" type="text" placeholder="Hi! How can we help?" />
              <button type="submit" class="tiny">Send message</button>
            </form>
            <p class="small muted" style="margin:8px 0 0">This frame posts to its parent with target origin <code>*</code>. It never checks who the parent is, and the parent never checks who sent the message.</p>
          </div>`}):i({id:"dom-postmessage",app:"Nimbus Chat",title:"Chat",cookie:v,body:`
        <h1>Nimbus Chat</h1>
        <p class="muted small">Messages from the widget are rendered into the conversation.</p>
        <div class="card" id="box" style="min-height:64px">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;letter-spacing:.08em;text-transform:uppercase">Conversation</div>
          <p class="muted small" id="placeholder" style="margin:6px 0 0">No messages yet \u2014 send one from the widget below.</p>
        </div>
        <p class="small muted" id="mlog" style="margin:8px 0 0">last message origin: \u2014</p>
        <div style="margin-top:12px;border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#fff">
          <iframe src="/lab/dom-postmessage/widget" sandbox="allow-scripts allow-forms" style="width:100%;height:190px;border:0" title="widget"></iframe>
        </div>
        <!-- INTENTIONAL VULNERABILITY: no event.origin check, then innerHTML -->
        <script>
          window.addEventListener('message', function (e) {
            document.getElementById('mlog').textContent = 'last message origin: ' + e.origin;
            var box = document.getElementById('box');
            box.innerHTML = '<div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;letter-spacing:.08em;text-transform:uppercase">Conversation</div><div id="msg"></div>';
            box.querySelector('#msg').innerHTML = e.data;
          });
        <\/script>`})}},"dom-windowname":{handle({segs:e}){return e[0]==="partner"?i({id:"dom-windowname",app:"Greenleaf Store",title:"Partner storefront",cookie:v,body:`
          <h1>Partner storefront</h1>
          <p class="muted small">Restoring your session state from the browsing context\u2026</p>
          <div class="card" id="restored"><span class="muted small">no state</span></div>
          <p class="small muted" style="margin-top:14px"><a href="/lab/dom-windowname">\u2190 back to step 1</a></p>
          <!-- INTENTIONAL VULNERABILITY: window.name written into HTML -->
          <script>
            document.getElementById('restored').innerHTML =
              window.name ? ('<div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;letter-spacing:.08em;text-transform:uppercase">Restored</div>' + window.name)
                          : '<span class="muted small">no state found</span>';
          <\/script>`}):i({id:"dom-windowname",app:"Attacker-ish page",title:"window.name step 1",cookie:v,body:`
        <h1>Step 1 \u2014 the site before the target</h1>
        <p class="muted small">Any page can set <code>window.name</code> and then send the visitor to another site. The value survives the navigation.</p>
        <form class="stack" style="margin-bottom:14px" onsubmit="event.preventDefault(); window.name = this.v.value; location.href = '/lab/dom-windowname/partner';">
          <div><label for="v">Value for window.name</label><input id="v" type="text" name="v" placeholder="<img src=x onerror=alert(1)>" /></div>
          <button type="submit">Set window.name and continue to partner site \u2192</button>
        </form>
        <div class="banner info">The partner page (step 2) writes <code>window.name</code> into its DOM as HTML. Your value crosses the navigation boundary with you.</div>`})}},"dom-json":{async handle({env:e,form:t,method:a,segs:o}){if(o[0]==="api"){let l=await p(e,{lab:"dom-json",kind:"note",limit:30});return f(l.map(r=>r.data),{headers:{"x-content-type-options":"nosniff","access-control-allow-origin":"*"}})}if(a==="POST")return await b(e,{lab:"dom-json",kind:"note",data:{author:"account-alerts",text:t.text||""}}),u("/lab/dom-json?saved=1");let n=`
        <h1>Notification centre</h1>
        <p class="muted small">Rendered in the browser from <code>/lab/dom-json/api</code>. ${(await p(e,{lab:"dom-json",kind:"note",limit:30})).length} notification(s) stored.</p>
        <form method="post" action="/lab/dom-json" class="stack" style="margin-bottom:16px">
          <div><label for="t">New notification text</label><input id="t" type="text" name="text" placeholder="Your workspace limit is approaching\u2026" /></div>
          <button type="submit">Add notification</button>
        </form>
        <div class="list" id="list"><div class="empty">loading\u2026</div></div>
        <!-- INTENTIONAL VULNERABILITY: client-side rendering with innerHTML -->
        <script>
          fetch('/lab/dom-json/api').then(function (r) { return r.json(); }).then(function (items) {
            var list = document.getElementById('list');
            if (!items.length) { list.innerHTML = '<div class="empty">No notifications.</div>'; return; }
            list.innerHTML = items.map(function (n) {
              return '<div class="item"><div class="meta">' + n.author + '</div>' + n.text + '</div>';
            }).join('');
          });
        <\/script>`;return i({id:"dom-json",app:"Nimbus Support",title:"Notifications",cookie:v,body:n})}},"dom-urlpath":{handle({url:e}){return i({id:"dom-urlpath",app:"Nimbus Docs",title:"Docs",cookie:v,body:`
        <h1>Docs viewer</h1>
        <p class="muted small">The breadcrumb is built from <code>location.pathname</code>.</p>
        <form class="stack" style="margin-bottom:16px" onsubmit="event.preventDefault(); location.href = '/lab/dom-urlpath/' + encodeURIComponent(this.s.value);">
          <div><label for="s">Document slug</label><input id="s" type="text" name="s" placeholder="getting-started" /></div>
          <button type="submit">Open document</button>
        </form>
        <div class="card">
          <p class="small muted" style="margin:0 0 4px">Breadcrumb</p>
          <div id="crumbs"></div>
        </div>
        <div class="nav-pills" style="margin-top:14px">
          <a href="/lab/dom-urlpath/getting-started">getting-started</a>
          <a href="/lab/dom-urlpath/api-keys">api-keys</a>
          <a href="/lab/dom-urlpath/billing">billing</a>
        </div>
        <!-- INTENTIONAL VULNERABILITY: path segment decoded and written with innerHTML -->
        <script>
          (function () {
            var seg = decodeURIComponent((location.pathname.split('/')[3] || ''));
            if (!seg) return;
            document.getElementById('crumbs').innerHTML = '<a href="/">Docs</a> / <span>' + seg + '</span>';
          })();
        <\/script>`})}},"dom-clobbering":{async handle({env:e,form:t,method:a,segs:o}){if(o[0]==="ping")return f({ok:!0,note:"legit heartbeat endpoint"});let s="dom-clobbering:name";if(a==="POST"){let r=t.name||"",c=String(r).replace(/<(?!\/?a[\s>])[^>]*>/gi,"").replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,"");return await T(e,s,c),u("/lab/dom-clobbering?saved=1")}let n=await N(e,s,"")||"",l=`
        <h1>Display name</h1>
        <p class="muted small">Links are allowed in your name; everything else is tidied away. The name is rendered as HTML.</p>
        <form method="post" action="/lab/dom-clobbering" class="stack" style="margin-bottom:14px">
          <div><label for="n">Display name</label><input id="n" type="text" name="name" value="${d(n)}" placeholder='<a href="/">Dana</a>' /></div>
          <button type="submit">Save display name</button>
        </form>
        <div class="card">
          <p class="small muted" style="margin:0 0 4px">How your name renders:</p>
          <div id="name">${n||'<span class="muted">(not set)</span>'}</div>
        </div>
        <div class="card" style="margin-top:14px">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Config heartbeat</div>
          <p class="small muted" style="margin:6px 0">On load the page sends a heartbeat, including the session, to the endpoint in its config.</p>
          <p class="small" id="beat" style="margin:0">waiting\u2026</p>
          <p style="margin:8px 0 0"><button type="button" class="tiny" id="beat-btn">Send heartbeat now</button></p>
        </div>
        <p class="small muted">The endpoint is read from <code>window.appConfig.endpoint</code> \u2014 a global the theme partial is supposed to inject.</p>
        <!-- INTENTIONAL VULNERABILITY: config read from a DOM-clobberable global -->
        <script>
          (function () {
            var cfg = window.appConfig || {};
            var endpoint = (cfg.endpoint && (cfg.endpoint.href || cfg.endpoint.value)) || '/lab/dom-clobbering/ping';
            function beat() {
              var url = String(endpoint) + (String(endpoint).indexOf('?') > -1 ? '&' : '?') + 'd=' + encodeURIComponent(document.cookie);
              fetch(url).then(function () {
                document.getElementById('beat').textContent = 'heartbeat sent to ' + url.slice(0, 140);
              }).catch(function () {
                document.getElementById('beat').textContent = 'heartbeat failed for ' + url.slice(0, 140);
              });
            }
            document.getElementById('beat-btn').addEventListener('click', beat);
            beat();
          })();
        <\/script>`;return i({id:"dom-clobbering",app:"Nimbus Docs",title:"Display name",cookie:v,body:l})}}};var P="session=usr_5f2c91d7; theme=bypass";function te(e){return String(e).replace(/<script[\s\S]*?<\/script\s*>/gi,"").replace(/<\/?script[^>]*>/gi,"")}function ae(e){return String(e).replace(/<\/?script>/gi,"").replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi,"")}var K={"bypass-tag-blacklist":{handle({url:e}){let t=e.searchParams.get("q")||"",a=te(t),o=`
        <h1>Reviews</h1>
        <p class="muted small">Reviews go through our sanitiser before they are shown: script tags are removed.</p>
        <form method="get" action="/lab/bypass-tag-blacklist" class="stack" style="margin-bottom:14px">
          <div><label for="q">Write a review</label><textarea id="q" name="q" placeholder="Loved it!">${d(t)}</textarea></div>
          <button type="submit">Preview review</button>
        </form>
        ${t?`<div class="card">
                 <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Your review</div>
                 <!-- INTENTIONAL VULNERABILITY: blocklist of one tag, output unencoded -->
                 <div class="msg">${a}</div>
               </div>
               <p class="small muted" style="margin-top:10px">Sanitiser output: <code>${d(a)}</code></p>`:'<div class="empty">Nothing previewed yet.</div>'}`;return i({id:"bypass-tag-blacklist",app:"Polygon Shop",title:"Reviews",cookie:P,body:o})}},"bypass-nested-tag":{handle({url:e}){let t=e.searchParams.get("q")||"",a=ae(t),o=`
        <h1>Comments</h1>
        <p class="muted small">Hardened sanitiser: removes <code>&lt;script&gt;</code>, <code>&lt;/script&gt;</code> and every <code>on*</code> handler.</p>
        <form method="get" action="/lab/bypass-nested-tag" class="stack" style="margin-bottom:14px">
          <div><label for="q">Comment</label><textarea id="q" name="q" placeholder="Great post!">${d(t)}</textarea></div>
          <button type="submit">Post</button>
        </form>
        ${t?`<div class="card">
                 <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Posted</div>
                 <!-- INTENTIONAL VULNERABILITY: non-recursive string replacement, output unencoded -->
                 <div class="msg">${a}</div>
               </div>
               <p class="small muted" style="margin-top:10px">Filter code: <code>input.replace(/&lt;\\/?script&gt;/gi, '').replace(/\\son\\w+\\s*=/gi, '')</code></p>`:'<div class="empty">No comment yet.</div>'}`;return i({id:"bypass-nested-tag",app:"PixelPress",title:"Comments",cookie:P,body:o})}},"bypass-csp-jsonp":{handle({url:e}){let t=e.searchParams.get("q")||"",a=`
        <h1>Nimbus Cloud status</h1>
        <p class="muted small">This page ships a strict CSP: <code>script-src 'self'</code>. Inline script is blocked.</p>
        <div class="banner info">Legacy widget endpoint still available: <code>/api/jsonp?cb=name</code> returns <code>name({...})</code>.</div>
        <form method="get" action="/lab/bypass-csp-jsonp" class="stack" style="margin:14px 0">
          <div><label for="q">Status page search</label><input id="q" type="text" name="q" value="${d(t)}" placeholder="incident, latency, uptime" /></div>
          <button type="submit">Search</button>
        </form>
        ${t?`<div class="card">
                 <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Search</div>
                 <!-- INTENTIONAL VULNERABILITY: unencoded reflection -->
                 <div class="msg">Results for ${t}</div>
               </div>`:'<div class="empty">No search yet. All systems operational.</div>'}
        <p class="small muted" style="margin-top:14px">CSP in force:
          <code>default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'</code></p>`;return x(i({id:"bypass-csp-jsonp",app:"Nimbus Cloud",title:"Status",cookie:P,body:a}),{headers:{"content-security-policy":"default-src 'self'; script-src 'self'; object-src 'none'; base-uri 'none'"}})}},"bypass-csti":{handle({url:e}){let t=e.searchParams.get("t")||"",a=`
        <h1>Newsletter greeting</h1>
        <p class="muted small">Write your greeting template. Use <code>{{ user.name }}</code> for the subscriber name.</p>
        <form method="get" action="/lab/bypass-csti" class="stack" style="margin-bottom:14px">
          <div><label for="t">Template</label><textarea id="t" name="t" placeholder="Hi {{ user.name }}, thanks for reading!">${d(t)}</textarea></div>
          <button type="submit">Render preview</button>
        </form>
        <div class="card">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Rendered</div>
          <div id="out" style="margin-top:4px"></div>
        </div>
        <!-- INTENTIONAL VULNERABILITY: user input compiled as a template expression -->
        <script>
          function renderTemplate(tpl, scope) {
            return String(tpl).replace(/\\{\\{([\\s\\S]+?)\\}\\}/g, function (_, expr) {
              try {
                return String(new Function('scope', 'with (scope) { return (' + expr + '); }')(scope));
              } catch (e) {
                return '[template error]';
              }
            });
          }
          (function () {
            var tpl = ${JSON.stringify(t)};
            if (!tpl) return;
            var out = document.getElementById('out');
            out.innerHTML = renderTemplate(tpl, { user: { name: 'Dana', plan: 'pro' } });
          })();
        <\/script>`;return i({id:"bypass-csti",app:"PixelPress",title:"Greeting template",cookie:P,body:a})}}};var C="session=usr_5f2c91d7; theme=leaf",j="session=adm_71be4f0c9a; role=agent";function U(e){let t=Math.max(1,Math.round((Date.now()-e)/1e3));return t<60?`${t}s ago`:`${Math.round(t/60)}m ago`}var W={"blind-contact":{async handle({env:e,form:t,method:a,segs:o}){if(a==="POST")return await b(e,{lab:"blind-contact",kind:"message",data:{name:t.name||"anonymous",email:t.email||"",message:t.message||""}}),u("/lab/blind-contact?sent=1");let s=await p(e,{lab:"blind-contact",kind:"message",limit:30});if(o[0]==="admin"){let l=s.length?s.map(c=>`<div class="item">
                  <div class="meta">${U(c.createdAt)} \xB7 ${d(c.data.name)} \xB7 ${d(c.data.email)}</div>
                  <!-- INTENTIONAL VULNERABILITY: staff queue renders the message as HTML -->
                  <div>${c.data.message}</div>
                </div>`).join(""):'<div class="empty">Nothing in the queue.</div>',r=`
          <h1>Staff queue</h1>
          <p class="muted small">Internal \xB7 messages from the contact form. ${s.length} waiting.</p>
          <div class="list">${l}</div>
          <p class="small muted" style="margin-top:14px">You cannot see this page as a visitor. Payloads here report back over HTTP instead.</p>`;return i({id:"blind-contact",app:"Greenleaf Store",title:"Staff queue",cookie:j,who:"staff@greenleaf.example",body:r})}let n=`
        <h1>Contact Greenleaf</h1>
        <p class="muted small">We reply within one business day.</p>
        <form method="post" action="/lab/blind-contact" class="stack">
          <div><label for="n">Name</label><input id="n" type="text" name="name" placeholder="Your name" /></div>
          <div><label for="e">Email</label><input id="e" type="email" name="email" placeholder="you@example.com" /></div>
          <div><label for="m">Message</label><textarea id="m" name="message" placeholder="How can we help?"></textarea></div>
          <button type="submit">Send message</button>
        </form>
        ${t.sent,""}
        <div class="banner ok" style="margin-top:14px">Thanks \u2014 your message is in the queue. You will only ever see this confirmation page.</div>`;return i({id:"blind-contact",app:"Greenleaf Store",title:"Contact us",cookie:C,body:n})}},"blind-header":{async handle({env:e,form:t,method:a,segs:o}){if(a==="POST")return await b(e,{lab:"blind-header",kind:"visit",data:{ua:t.ua||"",path:t.path||"/pricing",ip:"203.0.113."+(Math.floor(Math.random()*200)+10)}}),u("/lab/blind-header?logged=1");let s=await p(e,{lab:"blind-header",kind:"visit",limit:40});if(o[0]==="admin"){let l=s.length?s.map(c=>`<tr>
                  <td class="mono">${d(c.data.ip)}</td>
                  <td>${d(c.data.path)}</td>
                  <!-- INTENTIONAL VULNERABILITY: captured header rendered as HTML -->
                  <td class="mono">${c.data.ua}</td>
                  <td>${U(c.createdAt)}</td>
                </tr>`).join(""):'<tr><td colspan="4" class="empty">No traffic captured.</td></tr>',r=`
          <h1>Recent visitors</h1>
          <p class="muted small">Internal analytics widget \xB7 last ${s.length} requests.</p>
          <table>
            <thead><tr><th>IP</th><th>Path</th><th>User-Agent</th><th>When</th></tr></thead>
            <tbody>${l}</tbody>
          </table>`;return i({id:"blind-header",app:"Nimbus Support",title:"Recent visitors",cookie:j,who:"analytics@nimbus.example",body:r,wide:!0})}return i({id:"blind-header",app:"Nimbus Support",title:"Request inspector",cookie:C,body:`
        <h1>Request inspector</h1>
        <p class="muted small">This lab runs in a browser, so it cannot receive real headers. Submit a header value exactly as a proxy would capture it \u2014 that is the same string support staff will see.</p>
        <form method="post" action="/lab/blind-header" class="stack">
          <div><label for="ua">User-Agent value</label><input id="ua" type="text" name="ua" placeholder="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)\u2026" /></div>
          <div><label for="p">Requested path</label><input id="p" type="text" name="path" value="/pricing" /></div>
          <button type="submit">Log this request</button>
        </form>
        <div class="banner info" style="margin-top:14px">Logged values are displayed in an internal "recent visitors" widget. You cannot open that widget as a visitor \u2014 see the Victim view panel.</div>`})}},"blind-exfil":{async handle({env:e,form:t,method:a,segs:o}){if(a==="POST")return await b(e,{lab:"blind-exfil",kind:"note",data:{ticket:t.ticket||"T-4812",author:t.author||"customer",note:t.note||""}}),u("/lab/blind-exfil?sent=1");let s=await p(e,{lab:"blind-exfil",kind:"note",limit:30});if(o[0]==="admin"){let r=`
          <h1>Ticket T-4812 \u2014 agent console</h1>
          <p class="muted small">Signed in as agent \xB7 customer notes below. Billing actions and workspace deletion are available from this view.</p>
          <div class="banner warn">Session in this frame: <code>session=adm_71be4f0c9a</code> \xB7 role=agent. A payload that runs here can read it.</div>
          <div class="list" style="margin-top:12px">${s.length?s.map(c=>`<div class="item">
                  <div class="meta">${d(c.data.ticket)} \xB7 from ${d(c.data.author)} \xB7 ${U(c.createdAt)}</div>
                  <!-- INTENTIONAL VULNERABILITY: customer note rendered as HTML inside an agent session -->
                  <div>${c.data.note}</div>
                </div>`).join(""):'<div class="empty">No notes on this ticket.</div>'}</div>`;return i({id:"blind-exfil",app:"Nimbus Support",title:"Agent console",cookie:j,who:"agent@nimbus.example",body:r})}return i({id:"blind-exfil",app:"Nimbus Support",title:"Ticket note",cookie:C,body:`
        <h1>Add a note to your ticket</h1>
        <p class="muted small">Notes are visible to the agent handling your ticket. You will never see the agent console.</p>
        <form method="post" action="/lab/blind-exfil" class="stack">
          <div><label for="t">Ticket</label><input id="t" type="text" name="ticket" value="T-4812" /></div>
          <div><label for="n">Note</label><textarea id="n" name="note" placeholder="Additional context for the agent\u2026"></textarea></div>
          <button type="submit">Save note</button>
        </form>
        <div class="banner ok" style="margin-top:14px">Got it. Your agent will see this note on their next refresh.</div>`})}}};var J={"self-console":{handle(){return i({id:"self-console",app:"PixelPress",title:"Simulated console",cookie:"session=usr_5f2c91d7; theme=pixel",body:`
        <h1>Simulated developer console</h1>
        <p class="muted small">This stands in for your browser's devtools console: whatever you run here executes with this page's privileges. That is exactly how a self-XSS scam works.</p>
        <div class="card stack">
          <div>
            <label for="code">Console input</label>
            <textarea id="code" placeholder="1 + 1">1 + 1</textarea>
          </div>
          <div class="row">
            <button type="button" id="run">Run</button>
            <button type="button" class="ghost" id="clear">Clear output</button>
          </div>
          <pre id="out">\u2014 output \u2014</pre>
        </div>
        <div class="banner warn" style="margin-top:14px">
          <b>The scam, in one line:</b> "paste this into your console to unlock the theme". The payload runs with your session,
          on the account you are already logged into. There is no server-side flaw to fix \u2014 the defence is that you never paste code
          you were handed by a stranger.
        </div>
        <p class="small muted" style="margin-top:12px">This is a self-contained simulation: the only thing your payload can reach is
          this sandboxed frame's simulated cookie jar, and the range's own attacker console.</p>
        <script>
          (function () {
            var code = document.getElementById('code');
            var out = document.getElementById('out');
            document.getElementById('run').addEventListener('click', function () {
              try { out.textContent = String(eval(code.value)); }
              catch (e) { out.textContent = 'Uncaught ' + e.name + ': ' + e.message; }
            });
            document.getElementById('clear').addEventListener('click', function () { out.textContent = '\u2014 output \u2014'; });
          })();
        <\/script>`})}}};var L="session=usr_5f2c91d7; theme=leaf",oe="session=adm_71be4f0c9a; role=agent",se="session=adm_4b2a8e5d11; role=moderator";function ne(e){return String(e).replace(/\*\*([^*]+)\*\*/g,"<strong>$1</strong>").replace(/\*([^*]+)\*/g,"<em>$1</em>").replace(/`([^`]+)`/g,"<code>$1</code>").replace(/\[([^\]]+)\]\(([^)\s]+)\)/g,'<a href="$2">$1</a>').replace(/\n/g,"<br />")}function R(e){let t=Math.max(1,Math.round((Date.now()-e)/1e3));return t<60?`${t}s ago`:`${Math.round(t/60)}m ago`}var X={"rw-blog-moderator":{async handle({env:e,form:t,method:a,segs:o}){let s="rw-blog-moderator:approved",n=new Set((await N(e,s,"")||"").split(",").filter(Boolean));if(o[0]==="admin"){if(a==="POST")return t.approve&&n.add(String(t.approve)),t.reject&&n.delete(String(t.reject)),await T(e,s,[...n].join(",")),u("/lab/rw-blog-moderator/admin");let g=await p(e,{lab:"rw-blog-moderator",kind:"comment",limit:40}),Z=`
          <h1>Moderation queue</h1>
          <p class="muted small">Signed in as moderator. Comments awaiting review are rendered so you can see formatting.</p>
          <div class="banner warn">Reading the queue is enough to trigger a payload \u2014 approval is not required.</div>
          <div class="list" style="margin-top:12px">${g.length?g.map(k=>`<div class="item">
                  <div class="meta">${d(k.data.author)} \xB7 ${R(k.createdAt)} \xB7 ${n.has(String(k.id))?"published":"pending"}</div>
                  <!-- INTENTIONAL VULNERABILITY: moderation queue renders the pending comment as HTML -->
                  <div>${k.data.body}</div>
                  <form method="post" action="/lab/rw-blog-moderator/admin" class="row" style="margin-top:8px">
                    <input type="hidden" name="${n.has(String(k.id))?"reject":"approve"}" value="${k.id}" />
                    <button class="tiny" type="submit">${n.has(String(k.id))?"Unpublish":"Approve"}</button>
                  </form>
                </div>`).join(""):'<div class="empty">Queue is empty.</div>'}</div>`;return i({id:"rw-blog-moderator",app:"PixelPress",title:"Moderation queue",cookie:se,who:"moderator@pixelpress.example",body:Z})}if(a==="POST")return await b(e,{lab:"rw-blog-moderator",kind:"comment",data:{author:t.author||"reader",body:t.body||""}}),u("/lab/rw-blog-moderator?posted=1");let l=await p(e,{lab:"rw-blog-moderator",kind:"comment",limit:40}),r=l.filter(g=>n.has(String(g.id))),c=l.length-r.length,m=r.length?r.map(g=>`<div class="item">
                <div class="meta">${d(g.data.author)} \xB7 ${R(g.createdAt)}</div>
                <!-- INTENTIONAL VULNERABILITY: published comment rendered as HTML -->
                <div>${g.data.body}</div>
              </div>`).join(""):'<div class="empty">No comments published yet.</div>',h=`
        <h1>Why your framework does not save you</h1>
        <p class="muted small">By the PixelPress team \xB7 6 min read \xB7 ${r.length} comments \xB7 ${c} awaiting review</p>
        <div class="card" style="margin:12px 0">
          <p style="margin:0">Escaping is a property of a template, not of a framework. The moment someone concatenates a string,
          or reaches for an HTML sink "just here", the guarantee is gone. Our own comment section is the proof.</p>
        </div>
        <h2>Leave a comment</h2>
        <form method="post" action="/lab/rw-blog-moderator" class="stack">
          <div><label for="a">Name</label><input id="a" type="text" name="author" placeholder="Your name" /></div>
          <div><label for="b">Comment</label><textarea id="b" name="body" placeholder="Great write-up\u2026"></textarea></div>
          <button type="submit">Post comment (moderated)</button>
        </form>
        <h2>Comments (${r.length})</h2>
        <div class="list">${m}</div>`;return i({id:"rw-blog-moderator",app:"PixelPress",title:"Blog",cookie:L,body:h})}},"rw-support-ticket":{async handle({env:e,form:t,method:a,segs:o}){if(a==="POST"&&o[0]!=="admin")return await b(e,{lab:"rw-support-ticket",kind:"ticket",data:{subject:t.subject||"(no subject)",body:t.body||"",from:t.from||"customer"}}),u("/lab/rw-support-ticket?sent=1");let s=await p(e,{lab:"rw-support-ticket",kind:"ticket",limit:30});if(o[0]==="admin"){let r=s.length?s.map(m=>`<div class="item">
                  <div class="meta">${d(m.data.from)} \xB7 ${R(m.createdAt)} \xB7 open</div>
                  <div><b>${d(m.data.subject)}</b></div>
                  <!-- INTENTIONAL VULNERABILITY: ticket body rendered as HTML in the agent console -->
                  <div style="margin-top:4px">${m.data.body}</div>
                </div>`).join(""):'<div class="empty">No tickets.</div>',c=`
          <h1>Agent console</h1>
          <p class="muted small">Signed in as <code>agent@nimbus.example</code> \xB7 ${s.length} ticket(s)</p>
          <div class="banner warn">This console can reset passwords, change plans and export invoices for any account.</div>
          <div class="list" style="margin-top:12px">${r}</div>`;return i({id:"rw-support-ticket",app:"Nimbus Support",title:"Agent console",cookie:oe,who:"agent@nimbus.example",body:c})}let n=s.length?s.map(r=>`<div class="item"><div class="meta">${R(r.createdAt)}</div>${d(r.data.subject)}</div>`).join(""):'<div class="empty">You have no tickets.</div>',l=`
        <h1>Open a support ticket</h1>
        <p class="muted small">Average first response: 2 hours.</p>
        <form method="post" action="/lab/rw-support-ticket" class="stack">
          <div><label for="f">From</label><input id="f" type="text" name="from" placeholder="your@email.com" /></div>
          <div><label for="s">Subject</label><input id="s" type="text" name="subject" placeholder="Cannot export invoices" /></div>
          <div><label for="b">Description</label><textarea id="b" name="body" placeholder="Tell us what happened\u2026"></textarea></div>
          <button type="submit">Submit ticket</button>
        </form>
        <h2>Your tickets (${s.length})</h2>
        <div class="list">${n}</div>`;return i({id:"rw-support-ticket",app:"Nimbus Support",title:"Support",cookie:L,body:l})}},"rw-password-reset":{handle({url:e}){let t=e.searchParams.get("email")||"dana@example.com",a=t.replace(/[<>]/g,""),o="rt_9f31c7e0b4",s=`
        <h1>Reset your password</h1>
        <p class="muted small">Greenleaf account recovery.</p>
        <form method="get" action="/lab/rw-password-reset" class="row" style="margin:12px 0">
          <input type="text" name="email" value="${d(t)}" style="flex:1" placeholder="you@example.com" />
          <button type="submit">Send reset link</button>
        </form>
        <div class="card">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Reset token issued for this link</div>
          <pre id="issued" style="margin-top:6px">${o}</pre>
          <p class="small muted" style="margin:8px 0 0">In a real flow this token would be in the URL and bound to the account. Here it is displayed so you can prove you reached it.</p>
        </div>
        <p class="small muted" id="greet" style="margin-top:14px"></p>
        <!-- INTENTIONAL VULNERABILITY: request data concatenated into a JavaScript string -->
        <script>
          var email = '${a}';
          document.getElementById('greet').textContent = 'Reset link sent to ' + email;
          var resetToken = '${o}';
        <\/script>`;return i({id:"rw-password-reset",app:"Greenleaf Store",title:"Reset password",cookie:L,body:s})}},"rw-oauth-state":{handle({url:e}){let t=e.searchParams.get("client_id")||"nimbus-workspace",a=`
        <h1>Authorize application</h1>
        <p class="muted small"><b>${d(t)}</b> is requesting access to your Nimbus Cloud account.</p>
        <div class="banner warn">Scopes requested: <code>profile</code>, <code>workspaces.read</code>, <code>workspaces.write</code></div>
        <div class="row" style="margin:14px 0">
          <button type="button" onclick="document.getElementById('decision').textContent='Approved \u2014 token issued below.'">Approve</button>
          <button type="button" class="ghost" onclick="document.getElementById('decision').textContent='Denied.'">Deny</button>
        </div>
        <div class="card">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Access token issued to this session</div>
          <pre id="issued" style="margin-top:6px">at_7f21c9d4ab3e</pre>
          <p class="small muted" id="decision" style="margin:8px 0 0">Awaiting your decision.</p>
        </div>
        <div id="state-slot"></div>
        <!-- INTENTIONAL VULNERABILITY: state reflected with document.write -->
        <script>
          (function () {
            var state = new URLSearchParams(location.search).get('state') || '';
            if (!state) return;
            document.write('<input type="hidden" name="state" value="' + state + '">');
            document.write('<div class="card" style="margin-top:14px"><div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Callback state</div><div>' + state + '</div></div>');
          })();
        <\/script>`;return i({id:"rw-oauth-state",app:"Nimbus Cloud",title:"Authorize",cookie:"session=usr_5f2c91d7; theme=cloud",body:a})}},"rw-chat-widget":{handle({segs:e}){return e[0]==="widget"?i({id:"rw-chat-widget",app:"Nimbus Chat widget",title:"Widget",cookie:"",body:`
          <div class="card">
            <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Embedded widget</div>
            <h2 id="brand" style="font-size:15px;margin:2px 0 8px">Acme Store</h2>
            <p class="small muted" style="margin:0">Hi! How can we help today?</p>
          </div>
          <!-- INTENTIONAL VULNERABILITY: no origin check, brand rendered with innerHTML -->
          <script>
            window.addEventListener('message', function (e) {
              var d = e.data || {};
              if (d.type !== 'config') return;
              document.getElementById('brand').innerHTML = d.brand || '';
            });
          <\/script>`}):i({id:"rw-chat-widget",app:"Acme Store",title:"Storefront",cookie:L,body:`
        <h1>Acme Store</h1>
        <p class="muted small">The Nimbus Chat widget is embedded below and configured by the host page with postMessage.</p>
        <div style="border:1px solid #e2e8f0;border-radius:12px;padding:10px;background:#fff;margin:12px 0">
          <iframe id="wf" src="/lab/rw-chat-widget/widget" sandbox="allow-scripts allow-forms" style="width:100%;height:150px;border:0" title="widget"></iframe>
        </div>
        <div class="card stack">
          <div class="meta" style="font:600 10px ui-monospace,monospace;color:#64748b;text-transform:uppercase;letter-spacing:.08em">Host page \xB7 widget config composer</div>
          <label for="msg">Message sent to the widget</label>
          <textarea id="msg">{"type":"config","brand":"Acme Store"}</textarea>
          <div class="row"><button type="button" id="send">postMessage to widget</button></div>
          <p class="small muted" style="margin:0">The widget accepts any message from any frame and renders <code>brand</code> as HTML.</p>
        </div>
        <script>
          document.getElementById('send').addEventListener('click', function () {
            var f = document.getElementById('wf');
            var raw = document.getElementById('msg').value;
            var payload;
            try { payload = JSON.parse(raw); }
            catch (e) { alert('Invalid JSON: ' + e.message); return; }
            f.contentWindow.postMessage(payload, '*');
          });
        <\/script>`})}},"rw-markdown":{async handle({env:e,form:t,method:a}){if(a==="POST")return await b(e,{lab:"rw-markdown",kind:"comment",data:{author:t.author||"reader",md:t.body||""}}),u("/lab/rw-markdown?posted=1");let o=await p(e,{lab:"rw-markdown",kind:"comment",limit:30}),s=o.length?o.map(l=>`<div class="item">
                <div class="meta">${d(l.data.author)} \xB7 ${R(l.createdAt)}</div>
                <!-- INTENTIONAL VULNERABILITY: markdown output inserted as HTML, raw HTML allowed -->
                <div class="md">${ne(l.data.md)}</div>
              </div>`).join(""):'<div class="empty">No comments yet.</div>',n=`
        <h1>Comments</h1>
        <p class="muted small">Markdown supported: <code>**bold**</code>, <code>*italic*</code>, <code>\`code\`</code>, <code>[links](url)</code>.</p>
        <form method="post" action="/lab/rw-markdown" class="stack">
          <div><label for="a">Name</label><input id="a" type="text" name="author" placeholder="Your name" /></div>
          <div><label for="b">Comment (markdown)</label><textarea id="b" name="body" placeholder="**Great** article"></textarea></div>
          <button type="submit">Post</button>
        </form>
        <h2>Comments (${o.length})</h2>
        <div class="list">${s}</div>`;return i({id:"rw-markdown",app:"PixelPress",title:"Comments",cookie:L,body:n})}},"rw-svg-upload":{async handle({env:e,url:t,form:a,method:o,segs:s}){if(s[0]==="file"){let c=t.searchParams.get("name")||"",h=(await p(e,{lab:"rw-svg-upload",kind:"asset",limit:50})).find(g=>g.data.name===c);return h?new Response(h.data.svg,{headers:{"content-type":"image/svg+xml","cache-control":"no-store","x-robots-tag":"noindex"}}):x("<!doctype html><h1>404</h1><p>No such file.</p>",{status:404})}if(o==="POST")return a.svg&&await b(e,{lab:"rw-svg-upload",kind:"asset",data:{name:a.name||"avatar.svg",svg:a.svg}}),u("/lab/rw-svg-upload?uploaded=1");let n=await p(e,{lab:"rw-svg-upload",kind:"asset",limit:30}),l=n.length?n.map(c=>`<div class="item">
                <div class="meta">${d(c.data.svg.length)} bytes \xB7 image/svg+xml</div>
                <a href="/lab/rw-svg-upload/file?name=${encodeURIComponent(c.data.name)}">${d(c.data.name)}</a>
              </div>`).join(""):'<div class="empty">No uploads yet.</div>',r=`
        <h1>Upload an avatar</h1>
        <p class="muted small">Accepted: png, jpg, gif, svg. Maximum 2 MB. This demo stores the SVG text rather than bytes.</p>
        <form method="post" action="/lab/rw-svg-upload" class="stack">
          <div><label for="n">File name</label><input id="n" type="text" name="name" value="avatar.svg" /></div>
          <div><label for="s">SVG content</label><textarea id="s" name="svg" style="min-height:120px" placeholder="&lt;svg xmlns=&quot;http://www.w3.org/2000/svg&quot;&gt;\u2026&lt;/svg&gt;"></textarea></div>
          <button type="submit">Upload</button>
        </form>
        <h2>Your files (${n.length})</h2>
        <div class="list">${l}</div>
        <p class="small muted" style="margin-top:14px">Files are served from the application origin with their original content type.</p>`;return i({id:"rw-svg-upload",app:"Nimbus Docs",title:"Avatar upload",cookie:L,body:r})}}};var B={...H,...F,...z,...K,...W,...J,...X},w={"access-control-allow-origin":"*","access-control-allow-methods":"GET, POST, OPTIONS","access-control-allow-headers":"content-type","cache-control":"no-store"};async function Q(e){let t=e.headers.get("content-type")||"";if(t.includes("application/x-www-form-urlencoded")||t.includes("multipart/form-data")){let a=await e.formData(),o={};for(let[s,n]of a.entries())o[s]=typeof n=="string"?n:n.name||"";return o}return{}}function ie(){return x(`<!doctype html><html><head><meta charset="utf-8"><title>Lab not found</title>
     <style>body{font:15px system-ui;background:#f4f6f9;color:#0f172a;padding:40px}h1{font-size:18px}a{color:#2563eb}</style>
     </head><body><h1>Lab not found</h1><p>That lab id does not exist. Go back to the range and pick one.</p>
     <p><a href="/">\u2190 back to XSSVault</a></p></body></html>`,{status:404})}async function re(e,t,a){let o=a.searchParams.get("lab")||"unknown",s=a.searchParams.get("src")||"get",n=a.searchParams.get("d")??a.searchParams.get("data")??"";if(e.method==="POST"){let l=e.headers.get("content-type")||"";if(l.includes("application/json"))try{let r=await e.json();o=r.lab||o,s=r.src||s,n=r.d??r.data??n}catch{}else if(l.includes("form")){let r=await Q(e);o=r.lab||o,s=r.src||s,n=r.d||r.data||n}else{let r=(await e.text()).slice(0,2e3);r&&(n=r)}}return await b(t,{lab:String(o).slice(0,60),kind:"attack",data:{src:String(s).slice(0,60),data:String(n).slice(0,2e3)}}),f({ok:!0},{headers:w})}async function de(e,t){let a=t.searchParams.get("all")==="1",o=t.searchParams.get("lab")||"",s=Math.min(Number(t.searchParams.get("limit"))||50,200),n;if(a){n=await p(e,{lab:"__all__",kind:"attack",limit:s});let r=new Map;for(let c of Object.keys(B)){let m=await p(e,{lab:c,kind:"attack",limit:s});for(let h of m)r.set(h.id,{id:h.id,lab:c,...h.data,ts:h.createdAt})}return n=[...r.values()].sort((c,m)=>m.id-c.id).slice(0,s),f({entries:n},{headers:w})}let l=await p(e,{lab:o,kind:"attack",limit:s});return f({entries:l.map(r=>({id:r.id,lab:o,...r.data,ts:r.createdAt}))},{headers:w})}async function le(e,t,a){let o=a.searchParams.get("lab");if(!o){let n=await t.text().catch(()=>"");n&&n!=="all"&&(o=n.trim())}let s=o?[o]:Object.keys(B);for(let n of s)await M(e,n);return f({ok:!0,cleared:s.length},{headers:w})}function ce(e){let t=e.searchParams.get("cb")||"callback";return/^[A-Za-z_$][\w$.]{0,64}$/.test(t)?new Response(`${t}(${JSON.stringify({ok:!0,note:"jsonp gadget",ts:Date.now()})});`,{headers:{"content-type":"application/javascript; charset=utf-8",...w}}):new Response("invalid callback",{status:400,headers:w})}function pe(e,t){let a=t.searchParams.get("id")||"lab",o=t.searchParams.get("ck")||"";return new Response(q(a,o),{headers:{"content-type":"application/javascript; charset=utf-8","cache-control":"no-store"}})}async function me(e,t){let a=t.searchParams.get("lab")||"";return a?(await M(e,a),f({ok:!0},{headers:w})):f({ok:!1,error:"lab required"},{status:400,headers:w})}async function ue(e,t,a){let s=a.pathname.slice(5).split("/").filter(Boolean),n=s[0]||"",l=s.slice(1),r=B[n];if(!r)return ie();let c={id:n,req:e,url:a,env:t,segs:l,method:e.method.toUpperCase(),form:e.method==="POST"?await Q(e):{},rawForm:null},m;try{m=await r.handle(c)}catch(E){return x(`<!doctype html><meta charset="utf-8"><body style="font:14px system-ui;padding:30px">
       <h1 style="font-size:16px">Lab error</h1><pre>${d(String(E&&E.stack?E.stack:E))}</pre></body>`,{status:500,headers:{"x-robots-tag":"noindex"}})}let h=m instanceof Response?m:x(m),g=new Headers(h.headers);return g.set("x-robots-tag","noindex, nofollow"),new Response(h.body,{status:h.status,headers:g})}var Ke={async fetch(e,t){let a=new URL(e.url),o=a.pathname;return e.method==="OPTIONS"?new Response(null,{status:204,headers:w}):o==="/api/health"?f({ok:!0,labs:Object.keys(B).length}):o==="/api/attack/log"?re(e,t,a):o==="/api/attack"?de(t,a):o==="/api/attack/clear"?le(t,e,a):o==="/api/reset"?me(t,a):o==="/api/jsonp"?ce(a):o==="/lab/_shim.js"?pe(t,a):o.startsWith("/lab/")?ue(e,t,a):t.ASSETS?t.ASSETS.fetch(e):new Response("Not found",{status:404})}};export{Ke as default};
