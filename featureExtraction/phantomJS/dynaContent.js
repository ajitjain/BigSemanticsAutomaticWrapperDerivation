/**
 * @author
 */

var site = '';

var defaultInterval = 250; //millis
var defaultTimeout = 3000; //millis

var performAction = function(url) {
	if (url.indexOf("www.target.com") >= 0) {
		$('#item-guestreviews-link').click();
		$('#item-overview').click();
		site = 'target';
		return true;
	} else if (url.indexOf("www.walmart.com") >= 0) {
		site = 'walmart';
		return true;
	} else if (url.indexOf("www.newegg.com") >= 0) {
		site = 'newegg';
		return true;
	} else {
		site = '';
		return false;
	}
};

var waitForContent = function(callback, timeoutMillis) {
	var timeout = timeoutMillis ? timeoutMillis : defaultTimeout;
    var startTime = new Date().getTime();
    var cond = false;
    
    var interval = setInterval(function() {
    	if ((new Date().getTime() - startTime < timeout) && !cond ) {
        	// re-check condition
        	if (site === 'target') {
        		cond = (document.getElementById("reviews-and-ratings") !== null) 
        				&& ((document.getElementsByClassName("context-buttom-gap tabtextfont") !== null) 
        					|| (document.getElementsByClassName("context-buttom-gap innerlistings") !== null));
        	} else if (site === 'walmart') {
        		cond = (document.getElementById("BVRRRatingSummaryLinkWriteFirstID") !== null) ||
        					(document.getElementById("BVRRRatingSummaryLinkFirstID") !== null);
        	} else if (site === 'newegg') {
        		cond = (document.getElementById("CombineBoxFinalPrice") !== null);				
        	} else {
        		cond = true;
        	}
        } else {
            if(!cond) {
                // condition not met in timeout period
                console.log("'waitForContent()' timeout");
            } else {
                // condition met
                console.log("'waitForContent()' finished in " + (new Date().getTime() - startTime) + "ms.");
            }
            clearInterval(interval); // stop interval
            typeof(callback) === "string" ? eval(callback) : callback(); 
        }
    }, defaultInterval);
};