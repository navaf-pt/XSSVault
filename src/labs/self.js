import { labPage, esc } from '../shell.js';

export const LABS = {
  'self-console': {
    handle() {
      const body = `
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
          <pre id="out">— output —</pre>
        </div>
        <div class="banner warn" style="margin-top:14px">
          <b>The scam, in one line:</b> "paste this into your console to unlock the theme". The payload runs with your session,
          on the account you are already logged into. There is no server-side flaw to fix — the defence is that you never paste code
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
            document.getElementById('clear').addEventListener('click', function () { out.textContent = '— output —'; });
          })();
        </script>`;
      return labPage({
        id: 'self-console',
        app: 'PixelPress',
        title: 'Simulated console',
        cookie: 'session=usr_5f2c91d7; theme=pixel',
        body,
      });
    },
  },
};
