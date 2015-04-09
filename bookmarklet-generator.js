<script>
// BOOKMARKLET GENERATOR
var script = "var scriptUrl='//cdn.rawgit.com/codealchemist/torrent-helper-bookmarklet/master/torrent-helper.bookmarklet.js';",
	js="javascript:(function(){ " + script + "var protocol = location.protocol;var bookmarkletUrl = protocol + scriptUrl;var script = document.createElement('script');script.src = bookmarkletUrl;document.body.appendChild(script); })()";
	div = document.createElement('div'),
	style="position:fixed; margin: auto; top: 20px; left:0; right:0; padding: 20px; width: 400px; border: 1px solid #ccc; background: white; border-radius: 5px; color: black;";

var html = '' +
	'<div style="' + style + '">' +
	'<div><strong>Install</strong> by dragging the following link to your bookmarks bar:</div>' +
	'<a href="' + js + '">Torrent Helper (github)</a> | ' +
	'<a href="javascript:void(0)" onclick="document.body.removeChild(this.parentElement.parentElement);">close</a>' +
	'</div>';

div.innerHTML = html;
document.body.appendChild(div);
</script>
