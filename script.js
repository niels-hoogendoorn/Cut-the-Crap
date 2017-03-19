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
    if (!isElement(storyElement)) return;
    if (!storyElement.classList.contains('_5jmm')) return;
    // Story with header
    if (storyElement.querySelector(storyHeaderSelector)) {
        var linkElements = storyElement.querySelectorAll(storyHeaderSelector + ' a'),
            authorElements = storyElement.querySelectorAll('._3x-2 ._5pbw._5vra a'),
            linkElementsHrefs = getArrayOfHrefs(linkElements),
            authorElementsHrefs = getArrayOfHrefs(authorElements),
            match = _.intersection(linkElementsHrefs, authorElementsHrefs);
        if (match.length == 0) {
            hideStory(storyElement);
            return;
        }
        // When a friend like/comment a story of page he follows
        // if(storyElement.querySelector('button.PageLikeButton')) {
        // 	hideStory(storyElement);
        // 	return;
        // }
    }
    // Sponsored Post
    if (storyElement.querySelector('._5g-l')) {
        hideStory(storyElement);
        return;
    }
    // Sponsored Page
    if (storyElement.querySelector('._3e_2._m8c')) {
        hideStory(storyElement);
        return;
    }
    // People you may know
    if (storyElement.querySelector('._1dwg._1w_m .mts')) {
        hideStory(storyElement);
        return;
    }

    // 
}

function hideStory(el) {
    if (hideStoryPreference) {
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
    return (typeof HTMLElement === "object" ? obj instanceof HTMLElement : obj && typeof obj === "object" && obj !== null && obj.nodeType === 1 && typeof obj.nodeName === "string");
}

function getArrayOfHrefs(elements) {
    var hrefs = [];
    [].forEach.call(elements, function(element) {
        hrefs.push(element.href.replace(/\?.+/, ''));
    });
    return hrefs;
}

// Variables
var regex = /Trump/i;
var search = regex.exec(document.body.innerText);

var selector = ":contains('Trump'), :contains('TRUMP'), :contains('trump')";


// Functions
function filterMild() {
    console.log("Filtering Trump with Mild filter...");
    return $(selector).filter("h1,h2,h3,h4,h5,p,span,li");
}

function filterDefault () {
    console.log("Filtering Trump with Default filter...");
    return $(selector).filter(":only-child").closest('div');
}

function filterVindictive() {
    console.log("Filtering Trump with Vindictive filter...");
    return $(selector).filter(":not('body'):not('html')");
}

function getElements(filter) {
   if (filter == "mild") {
       return filterMild();
   } else if (filter == "vindictive") {
       return filterVindictive();
   } else if (filter == "aggro") {
       return filterDefault();
   } else {
     return filterMild();
   }
}

function filterElements(elements) {
    console.log("Elements to filter: ", elements);
    elements.fadeOut("fast");
}


// Implementation
if (search) {
   console.log("Donald Trump found on page! - Searching for elements...");
   chrome.storage.sync.get({
     filter: 'aggro',
   }, function(items) {
       console.log("Filter setting stored is: " + items.filter);
       elements = getElements(items.filter);
       filterElements(elements);
       chrome.runtime.sendMessage({method: "saveStats", trumps: elements.length}, function(response) {
              console.log("Logging " + elements.length + " trumps.");
         });
     });
  chrome.runtime.sendMessage({}, function(response) {});
}
