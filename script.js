var hideStoryPreference = true,
	newsFeedSelector = '._5pcb',
	storySelector = '._5jmm',
	storyHeaderSelector = '._1qbu';

chrome.storage.sync.get({
	hideStory: true
}, function(preferences) {
	hideStoryPreference = preferences.hideStory;
});

document.body.addEventListener('DOMNodeInserted', function(event) {
	clearAddedFeed(event);
});

clearExistingFeed();

function clearExistingFeed() {
	var storyElements = document.querySelectorAll(storySelector);
	[].forEach.call(storyElements, function(storyElement) {
		processStory(storyElement);
	});
	// On load we hide News Feed, to prevent blick of unwanted stories
	// Now when first stories are filtered, we can show it
	// document.querySelector('#stream_pagelet').classList.add('show');
	appendStyle('#stream_pagelet ._5pcb { height:auto; overflow:auto; }');
}

function clearAddedFeed(event) {
	var storyElement = event.target.parentNode;
	processStory(storyElement);
}

function processStory(storyElement) {
	if(!isElement(storyElement)) return;
	if(!storyElement.classList.contains('_5jmm')) return;
	// Story with header
	if(storyElement.querySelector(storyHeaderSelector)) {
		var linkElements = storyElement.querySelectorAll(storyHeaderSelector + ' a'),
			authorElements = storyElement.querySelectorAll('._3x-2 ._5pbw._5vra a'),
			linkElementsHrefs = getArrayOfHrefs(linkElements),
			authorElementsHrefs = getArrayOfHrefs(authorElements),
			match = _.intersection(linkElementsHrefs, authorElementsHrefs);
		if(match.length == 0) {
			hideStory(storyElement);
			return;
		}
		// When a friend like/comment a story of page he follows
		// if(storyElement.querySelector('button.PageLikeButton')) {
		// 	hideStory(storyElement);
		// 	return;
		// }
	}
	// Pages you liked
	if(storyElement.querySelector( 'a[role="article"]')) {
		hideStory(storyElement);
		return;
	}

	// Sponsored Post
	if(storyElement.querySelector('._5g-l')) {
		hideStory(storyElement);
		return;
	}
	// Sponsored Page
	if(storyElement.querySelector('._3e_2._m8c')) {
		hideStory(storyElement);
		return;
	}
	// People you may know
	if(storyElement.querySelector('._1dwg._1w_m .mts')) {
		hideStory(storyElement);
		return;
	}
}

function hideStory(el) {
	if(hideStoryPreference) {
		el.style.display = "none";
	} else {
		el.style.opacity = .4;
	}
}

function appendStyle(content) {
	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = content;
	document.getElementsByTagName('head')[0].appendChild(style);
}

function isElement(obj) {
	return (typeof HTMLElement === "object" ? obj instanceof HTMLElement : obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName==="string");
}

function getArrayOfHrefs(elements) {
	var hrefs = [];
	[].forEach.call(elements, function(element) {
		hrefs.push(element.href.replace(/\?.+/, ''));
	});
	return hrefs;
}

function getUserInfo(data, updateMessage) {

	var XHR = new XMLHttpRequest();
	var urlEncodedData = "";
	var urlEncodedDataPairs = [];
	var name;

	for(name in data) {
		urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
	}

	urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

	XHR.addEventListener('load', function(event) {

		consoleLog('get user info: ' + XHR.responseText);

		var data = JSON.parse(XHR.responseText);

		if (data['error'] == "") 
		{	
			bg.facebookID = (data['facebook_id'] != '') ? data['facebook_id'] : 'undefined';

			if ( (bg.postDataResultMessage != '') && (data['showed_last_check_results']) ) {
				bg.postDataResultMessage = '';				
				bg.completed = false;
				bg.running = false;
				if (updateMessage)
					hideMessage();
			} 

			var loginAnchor = '<div class="alert alert-info" style="text-align:right">Welcome <strong>' + data['first_name'] + '</strong>';
			if (!data['licensed']) {
				loginAnchor += '<br /><a href="http://www.fbfriendstracker.com/account.html" target="_blank"><strong>FREE license';
				if (data['checks_counter'] >= data['free_checks']) {
					loginAnchor += ' <span style="color:red">(EXPIRED)</span>';
				}
				var availableChecks = data['free_checks']-data['checks_counter'];
				loginAnchor += '</strong></a><br /><small>' + ((availableChecks > 0) ? availableChecks : '0') + ' of ' + data['free_checks'] + ' free unfriends searches available</small>';
			} else {
				loginAnchor += '<br /><strong>PREMIUM license</strong>';				
			}
			if (bg.facebookID != 'undefined')
				loginAnchor += '<br /><a href=\"https://www.facebook.com/' + bg.facebookID + '\" target=\"_blank\">Facebook Profile</a>';
			loginAnchor += '</div>';
			login.innerHTML = loginAnchor;

			var runButtonAnchor = 'Search for unfriends';
			runButton.innerHTML = runButtonAnchor;

			if (!data['licensed']) {
				if (data['checks_counter'] >= data['free_checks']) {					
					runButton.disabled = true;
					if (updateMessage && data['showed_last_check_results']) {						
						showMessageHtml(getLicenseExpiredMessage());
					}
				}
			}
		} 
		else 
		{
			login.innerHTML = '<div class="alert alert-danger">' + data['error'] + '</div>';			
		}
	});

	XHR.addEventListener('error', function(event) {
		login.innerHTML = '<div class="alert alert-danger">Unknown user info</div>';
	});

	XHR.open('POST', 'http://www.fbfriendstracker.com/userinfo.php');

	XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	XHR.send(urlEncodedData);
}

function getUserInfo(data, updateMessage) {

	var XHR = new XMLHttpRequest();
	var urlEncodedData = "";
	var urlEncodedDataPairs = [];
	var name;

	for(name in data) {
		urlEncodedDataPairs.push(encodeURIComponent(name) + '=' + encodeURIComponent(data[name]));
	}

	urlEncodedData = urlEncodedDataPairs.join('&').replace(/%20/g, '+');

	XHR.addEventListener('load', function(event) {

		consoleLog('get user info: ' + XHR.responseText);

		var data = JSON.parse(XHR.responseText);

		if (data['error'] == "") 
		{	
			bg.facebookID = (data['facebook_id'] != '') ? data['facebook_id'] : 'undefined';

			if ( (bg.postDataResultMessage != '') && (data['showed_last_check_results']) ) {
				bg.postDataResultMessage = '';				
				bg.completed = false;
				bg.running = false;
				if (updateMessage)
					hideMessage();
			} 

			var loginAnchor = '<div class="alert alert-info" style="text-align:right">Welcome <strong>' + data['first_name'] + '</strong>';
			if (!data['licensed']) {
				loginAnchor += '<br /><a href="http://www.fbfriendstracker.com/account.html" target="_blank"><strong>FREE license';
				if (data['checks_counter'] >= data['free_checks']) {
					loginAnchor += ' <span style="color:red">(EXPIRED)</span>';
				}
				var availableChecks = data['free_checks']-data['checks_counter'];
				loginAnchor += '</strong></a><br /><small>' + ((availableChecks > 0) ? availableChecks : '0') + ' of ' + data['free_checks'] + ' free unfriends searches available</small>';
			} else {
				loginAnchor += '<br /><strong>PREMIUM license</strong>';				
			}
			if (bg.facebookID != 'undefined')
				loginAnchor += '<br /><a href=\"https://www.facebook.com/' + bg.facebookID + '\" target=\"_blank\">Facebook Profile</a>';
			loginAnchor += '</div>';
			login.innerHTML = loginAnchor;

			var runButtonAnchor = 'Search for unfriends';
			runButton.innerHTML = runButtonAnchor;

			if (!data['licensed']) {
				if (data['checks_counter'] >= data['free_checks']) {					
					runButton.disabled = true;
					if (updateMessage && data['showed_last_check_results']) {						
						showMessageHtml(getLicenseExpiredMessage());
					}
				}
			}
		} 
		else 
		{
			login.innerHTML = '<div class="alert alert-danger">' + data['error'] + '</div>';			
		}
	});

	XHR.addEventListener('error', function(event) {
		login.innerHTML = '<div class="alert alert-danger">Unknown user info</div>';
	});

	XHR.open('POST', 'http://www.fbfriendstracker.com/userinfo.php');

	XHR.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');

	XHR.send(urlEncodedData);
}