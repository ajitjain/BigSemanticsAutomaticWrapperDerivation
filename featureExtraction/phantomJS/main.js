/**
 * unit that opens a webpage and 'evaluates' javascript within a sandbox environment
 * @author ajit
 */

var fs = require('fs');
fs.write("output.txt", '', 'w');	//remove this when features are to be obtained from multiple pages

var url = "http://www.amazon.com/Sennheiser-HD-280-Pro-Headphones/dp/B000065BPB/ref=sr_1_17?s=musical-instruments&ie=UTF8&qid=1362772852&sr=1-17";
var serviceURL = "http://ecology-service.cse.tamu.edu/BigSemanticsService/mmd.json?url=" + encodeURIComponent(url);

var page = require('webpage').create();
var p = require('webpage').create();

page.onConsoleMessage = function(msg) {
    console.log(msg);
    fs.write("output.txt", msg, 'a');
    fs.write("output.txt", '\n', 'a');
};

p.onConsoleMessage = function(msg) {
	console.log(msg);
};

var serviceResponse;

p.open(serviceURL, function(status) {
	if (status === "success") {
		console.log("success");
		serviceResponse = p.plainText;		
	}
});

page.onCallback = function(arg) {
	if (arg === 'mmd')
		return serviceResponse;
	if (arg === 'url')
		return url;
};

/**
 * note: page.evaluate() is a sandboxed environment and thus requires function definitions to be present right there. 
 */
page.open(url, function(status) {
    if ( status === "success" ) {
    	//page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
    	page.injectJs("dynaContent.js");
		page.injectJs("mmdDomHelper.js");
		page.injectJs("util.js");
		page.injectJs("featureExtractor.js");
		
		page.evaluate(function() {
			var url = window.callPhantom('url');
			
			if (performAction(url))
				waitForContent();
			    				
			var getMmdFromService = function() {
               	rawExtraction = false;
            	var mmd = window.callPhantom('mmd');
            	return mmd;
            }
            
			var labeledNodes = getLabeledNodesFromMetaMetadata(getMmdFromService());	                
            addLabelsAndExtractFeatures(labeledNodes, document);
		});
        phantom.exit();
    }
});
