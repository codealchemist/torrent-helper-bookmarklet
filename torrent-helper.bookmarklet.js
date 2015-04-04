/**
 * BOOKMARKLET: torrent helper.
 * 
 * Provides a basic UI to list and filter magnet links 
 * found in the page where it runs.
 * Clicking on an item selects the magnet link for easy
 * usage.
 */
var bookmarklet = (function bookmarklet() {
	var patterns = {
	    torrent: /http.*\.torrent/g,
	    magnet: /magnet:.*?(?=")/g
	};
	var initialized = false,
		linkType = 'magnet';

	/**
	 * Returns links found in page for passed type.
	 * Type can be "torrent" or "magnet".
	 * 
	 * @param  {string} type [magnet|torrent]
	 * @return {array} links collection
	 */
	function getLinks(type) {
		console.log('getLinks: type: ' + type);
		var matches = document.body.innerHTML.match(patterns[type]);
		return matches;
	}

	/**
	 * Adds passed styles string to page head.
	 * 
	 * @param {string} str css styles
	 */
	function addStyles(str) {
	    var node = document.createElement('style');
	    node.innerHTML = str;
	    document.head.appendChild(node);
	}

	/**
	 * UI object wrapper.
	 * Contains all UI methods and required data.
	 * 
	 * @return {object}
	 */
	var interface = (function() {
		console.log('interface');
		var loaded = false, //indicates if interface was loaded or not
			containerId = 'bookmarklet-torrent-helper',
			headerId = containerId + '-header',
			titleId = containerId + '-title',
			closeButtonId = containerId + '-close',
			filterId = containerId + '-filter',
			resultsId = containerId + '-results',
			resultName = containerId + '-result-name',
			resultLink = containerId + '-result-link',
			resultItem = containerId + '-result-item';

		// set base UI
		var html = '' +
		'<div id="' + containerId + '">' +
		'	<div id="' + closeButtonId + '">⚫</div>' +
		'	<div id="' + headerId + '">' +
		'		<h1 id="' + titleId + '">TORRENT HELPER</h1>' +
		'		<input id="' + filterId + '" placeholder="Filter torrents" />' +
		'	</div>' +
		'	<div id="' + resultsId + '"></div>' +
		'</div>';

		// UI elements
		var $container,
			$header,
			$title,
			$closeButton,
			$filter,
			$results;

		// cache UI elements
		function setElementsCache() {
			console.log('setElementsCache');
			$container = document.getElementById(containerId);
			$header = document.getElementById(headerId);
			$title = document.getElementById(titleId);
			$closeButton = document.getElementById(closeButtonId);
			$filter = document.getElementById(filterId);
			$results = document.getElementById(resultsId);
		}

		/**
		 * Set styles for UI elements.
		 * 
		 */
		function style() {
			// container style
			var styles = '#' + containerId + ' { ' +
				'position: fixed;' +
				'width: 500px;' +
				'height: calc(100% - 40px);' +
				'border: 1px solid gray;' +
				'background: white;' +
				'color: black;' +
				'font: normal normal normal 12px arial;' +
				'border-radius: 10px;' +
				'overflow: hidden;' +
				'margin: auto;' +
				'top: 0;' +
				'bottom: 0;' +
				'right: 0;' +
				'left: 0;' +
				' } \n';

			// header
			styles += '#' + headerId + ' { ' +
				'background: #eee;' +
				'padding: 20px;' +
				' } \n';

			// title
			styles += '#' + titleId + ' { ' +
			    'position: absolute;' +
				'top: 12px;' +
				' }\n';
			
			// close button
			styles += '#' + closeButtonId + ' { ' +
				'color: red;' +
				'cursor: pointer;' +
				'float: right;' +
				'padding: 10px 20px;' +
				' } \n';
			styles += '#' + closeButtonId + ':hover { ' +
				'color: orange;' +
				' } \n';

			// results style
			styles += '#' + resultsId + ' { ' +
				'width: calc(100% - 40px);' +
				'height: calc(100% - 120px);' +
				'overflow: auto;' +
				'padding: 10px 20px;' +
				' } \n';

			// result items style
			styles += '.' + resultItem + ' { ' +
				'margin: 2px 0;' +
				'border-bottom: 1px dashed #ccc;' +
				'padding: 5px 0;' +
				'width: 100%;' +
				'white-space: nowrap;' +
				'overflow: hidden;' +
				'text-overflow: ellipsis;' +
				' } \n';
			styles += '.' + resultItem + ':hover { ' +
				'background: #eee;' +
				'border-bottom: 1px solid #ccc;' +
				'cursor: pointer;' +
				' } \n';

			// result name style
			styles += '.' + resultName + ' { ' +
				'font-weight: bold;' +
				'padding: 0 5px 0 0;' +
				' } \n';

			// result link style
			styles += '.' + resultLink + ' { ' +
				'font-weight: lighter;' +
				' } \n';

			// filter
			styles += '#' + filterId + ' { ' +
				'width: calc(100% - 5px);' +
				' } \n';

			// add styles
			addStyles(styles);
		}

		/**
		 * Selects all text on passed html element.
		 * 
		 * @param  {string|object} element		
		 */
		function selectText(element) {
		    var doc = document, 
		    	range, selection;

    		text = element;
		    if (typeof element !== 'object') {
	    		text = doc.getElementById(element);
	    	}

		    if (doc.body.createTextRange) {
		        range = document.body.createTextRange();
		        range.moveToElementText(text);
		        range.select();
		    } else if (window.getSelection) {
		        selection = window.getSelection();        
		        range = document.createRange();
		        range.selectNodeContents(text);
		        selection.removeAllRanges();
		        selection.addRange(range);
		    }
		}

		/**
		 * Adds event handling for UI components.
		 * 
		 */
		function events() {
			console.log('events');

			var container = document.getElementById(containerId);
			if (container.addEventListener) {
			    container.addEventListener("click", handleClick, false);
			} else {
				container.addEventListener = function(eventName, callback){
					container.attachEvent("on" + eventName, callback);
				};
			    //container.attachEvent("onclick", handleClick);
			    container.addEventListener("click", handleClick, false);
			}

			/**
			 * Handle click events using delegation.
			 * 
			 * @param  {object} event
			 */
			function handleClick(event) {
			    event = event || window.event;
			    event.target = event.target || event.srcElement;
			    var element = event.target;

			    while (element) {
				    // result item
			        if (element.className === resultItem) {
			            console.log('+ ITEM clicked');
			            itemClick(element);
			        }

			        // close button
			        if (element.id === closeButtonId) {
			        	console.log('+ CLOSE button');
			        	hide();
			        }

			        // loop parent
			        element = element.parentElement;
		    	}
			}

			/**
			 * Called when a result item is clicked.
			 * 
			 * @param  {object} el
			 */
			function itemClick(el) {
				console.log(el);
				var linkEl = el.getElementsByClassName(resultLink)[0];
				selectText(linkEl);
			}

			/**
			 * Called when close button is clicked.
			 * 
			 */
			function closeClick() {
				console.log('+ CLOSE click');
				hide();
			}

			// filter events
			$filter.addEventListener('keyup', filter);
		}

		/**
		 * Loads UI.
		 * 
		 * @param  {string} html
		 */
		function load(html) {
			console.log('load');
			document.body.insertAdjacentHTML('beforeend', html);

			style();
			setElementsCache();
			loaded = true;
		}

		/**
		 * Shows UI.
		 * 
		 */
		function show() {
			console.log('show');

			if (loaded) {
				$container.style.display = 'block';
				return false;
			}
		}

		/**
		 * Hides UI.
		 * 
		 */
		function hide() {
			console.log('hide');
			$container.style.display = 'none';
		}

		/**
		 * Removes UI.
		 * 
		 */
		function remove() {
			$container.parentNode.removeChild(el);
			loaded = false;
		}

		/**
		 * Filters results based on passed text.
		 * If passed text is less than 3 chars shows all results.
		 * 
		 * @param  {string} text
		 */
		function filter(text) {
			if (typeof text === 'object') text = '';
			var filterText = text || $filter.value,
				minChars = 3;

			console.log('+ FILTER: ' + filterText);
			if (!filterText) {
				resetFilter();
				return false;
			}
			if (filterText.length < minChars) {
				console.log('skip, less than min chars: ' + minChars);
				resetFilter();
				return false;
			}

			/** 
			 * Convenient alias.
			 * Resets filter showing all results.
			 */
			function resetFilter() {
				applyFilter(true);
			}

			/**
			 * Applies current filter to results.
			 * If reset is true shows all results.
			 * 
			 * @param  {boolean} reset
			 */
			function applyFilter(reset) {
				var results = document.getElementsByClassName(resultItem);
				var total = results.length;
				for (var i=0; i<total; ++i) {
					var item = results[i],
						nameEl = item.getElementsByClassName(resultName)[0],
						name = nameEl.innerHTML;

					if (reset) {
						item.style.display = 'block';
						continue;
					}

					if ( !name.match(new RegExp(filterText, 'i')) ) {
						// show non matching element
						item.style.display = 'none';
					} else {
						// hide non matching element
						item.style.display = 'block';
					}
				}
			}

			applyFilter();
		}

		/**
		 * Adds passed string to results container.
		 * 
		 * @param {string} result
		 */
		function addResult(result) {
			var html = '<div class="' + resultItem + '">' + result + '</div>';
			$results.insertAdjacentHTML('beforeend', html);
		}

		/**
		 * Resets results.
		 * 
		 */
		function reset() {
			console.log('reset');
			$results.innerHTML = '';
		}

		/**
		 * Initializes UI.
		 * Loads and displays elements html.
		 * 
		 */
		function init() {
			console.log('init');
			load(html);
			show();
			initialized = true;
		}

		/**
		 * Returns name from passed link.
		 * 
		 * @param  {string} link can be a torrent or a magnet link
		 * @return {string} resource name
		 */
		function getName(link) {
			function getNameFromTorrentLink(link) {
				//TODO
			}

			function getNameFromMagnetLink(link) {
				var name = link.match(/dn=(.*?)&/)[1];
				return name;
			}

			var map = {
				magnet: getNameFromMagnetLink,
				torrent: getNameFromTorrentLink
			};

			if (!link) {
				console.log('ERROR: getName: empty link.');
				return false;
			}

			var name = map[linkType](link);
			return name;
		}

		/**
		 * Renders results and attaches events.
		 * 
		 * @param  {string} type [magnet|torrent]
		 */
		function render(type) {
			console.log('render: type: ' + type);
			linkType = type;
			if (!initialized) init();
			reset();
			var matches = getLinks(type);
			console.log(matches);
			var total = matches.length;
			for(var i=0; i<total; ++i) {
				var result = matches[i];
				var name = getName(result);
				result = '' +
					'<span class="' + resultName + '">' + name + '</span>' + 
					'<span class="' + resultLink + '">' + result + '</span>';

				addResult(result);
			}

			events();
		}

		//public interface
		return {
			show: show,
			hide: hide,
			render: render,
			style: style,
			init: init
		};
	})();

	return {
		interface: interface
	};
})();

// init UI rendering magnet links
bookmarklet.interface.render('magnet');

