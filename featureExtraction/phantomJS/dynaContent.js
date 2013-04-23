/**
 * @author
 */

var site;

var defaultInterval = 250; //millis
var defaultTimeout = 4000; //millis

var performAction = function(url) {
	if (url.indexOf("www.target.com") >= 0) {
		$('#item-guestreviews-link').click();
		site = 'target';
		return true;
	} else if if (url.indexOf("www.walmart.com") >= 0) {
		site = 'walmart';
		return true;
	} else {
		site = '';
		return false;
	}
}

var waitForContent = function(timeoutMillis) {
	var timeout = timeoutMillis ? timeoutMillis : defaultTimeout;
    var startTime = new Date().getTime();
    var cond = false;
    
    var interval = setInterval(function() {
        if ((new Date().getTime() - startTime < timeout) && !cond ) {
        	// re-check condition
        	if (site === 'target') {
        		
        	} else if (site === 'walmart') {
        		cond = !isNaN(document.getElementById("BVRRRatingSummaryLinkWriteFirstID")) ||
        					!isNaN(document.getElementById("BVRRRatingSummaryLinkFirstID"))
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
        }
    }, defaultInterval);
}