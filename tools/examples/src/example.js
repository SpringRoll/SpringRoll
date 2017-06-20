import 'google-code-prettify/bin/prettify.min.css';
import 'google-code-prettify/bin/prettify.min';
import 'google-code-prettify/bin/run_prettify.min';
import './css/main.css';

window.addEventListener('load', function()
{
    var $ = document.querySelector.bind(document);
    var content = $('#content');

    $('#canvas').addEventListener('click', function(e)
    {
        content.className = 'canvas';
        window.app.paused = false;
    });

    $('#code').addEventListener('click', function(e)
    {
        content.className = 'code';
        window.app.paused = true;
    });

    $('#back').addEventListener('click', function(e)
    {
        document.location.href = "index.html";
    });

    var codeContent = content.getElementsByTagName('script')[0].innerHTML;
    var codeDisplay = $('#codeDisplay');
    codeDisplay.innerHTML = prettyPrintOne(codeContent.replace(/^[\n\r]+/, ''));
    codeDisplay.className = 'prettyprint';
});
