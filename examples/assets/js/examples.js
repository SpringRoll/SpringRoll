(function(){
	
	window.addEventListener('load', function()
	{
		var content = document.getElementById('content');

		document.getElementById('canvas').addEventListener('click', function(e)
		{
			content.className = 'canvas';
			window.app.paused = false;
		});

		document.getElementById('code').addEventListener('click', function(e)
		{
			content.className = 'code';
			window.app.paused = true;
		});

		document.getElementById('back').addEventListener('click', function(e)
		{
			document.location.href = "index.html";
		});


		var codeContent = content.getElementsByTagName('script')[0].innerHTML;
		var codeDisplay = document.getElementById('codeDisplay');
		codeDisplay.innerHTML = prettyPrintOne(codeContent.replace(/^[\n\r]+/, ''));
		codeDisplay.className = 'prettyprint';
	});
	

}());