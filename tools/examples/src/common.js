import '@springroll/debug/lib/debug.css';
import '@springroll/display/lib/display.css';

import 'code-prettify/src/prettify.css';
import 'code-prettify/styles/sons-of-obsidian.css';
import './styles/main.css';
import 'code-prettify';

const links = document.querySelectorAll('#list a')

links.forEach(function(link) {
    let href = document.location.href;
    if (!/\.html$/.test(href)) {
        href += 'index.html';
    }
    if (link.href === href) {
        link.className = 'active';
    }
});

PR.prettyPrint();
