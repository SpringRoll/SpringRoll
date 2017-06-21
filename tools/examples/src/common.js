import 'code-prettify/src/prettify.css';
import './styles/main.css';
import 'code-prettify';

var $ = document.querySelector.bind(document);
var content = $('#content');

$('#canvas').addEventListener('click', function()
{
    content.className = 'canvas';
    // window.app.paused = false;
});

$('#code').addEventListener('click', function()
{
    content.className = 'code';
    // window.app.paused = true;
});

$('#back').addEventListener('click', function()
{
    document.location.href = "index.html";
});

var codeContent = content.getElementsByTagName('script')[0].innerHTML;
var codeDisplay = $('#codeDisplay');
codeDisplay.className = 'prettyprint';
codeDisplay.innerHTML = codeContent.replace(/^[\n\r]+/, '');
PR.prettyPrint();
