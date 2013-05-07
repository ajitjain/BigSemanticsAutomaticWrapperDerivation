/**
 * unit that opens a webpage and 'evaluates' javascript within a sandbox environment
 * @author ajit
 */

var index = 0;
var url = new Array();

// test urls
//url[index++] = "http://www.newegg.com/Product/Product.aspx?Item=9SIA15Y0AE3035";
//url[index++] = "http://www.newegg.com/Product/Product.aspx?Item=N82E16813128532";
//url[index++] = "http://www.walmart.com/ip/The-Hobbit-An-Unexpected-Journey-DVD-UltraViolet-Widescreen/23263613";
url[index++] = "http://www.walmart.com/ip/Twister-Dance/21097609";
//url[index++] = "http://www.target.com/p/keurig-elite-single-cup-home-brewing-system-k40/-/A-10174593";
//url[index++] = "http://www.target.com/p/daxx-men-s-bifold-leather-wallet-tan/-/A-14168682#prodSlot=medium_1_9";
//url[index++] = "http://www.amazon.com/DigitalsOnDemand-15-Item-Accessory-Bundle-Samsung/dp/B0088JR6WU/ref=sr_1_10?s=pc&ie=UTF8&qid=1366776461&sr=1-10";
//url[index++] = "http://www.amazon.com/Rotating-Samsung-Multi-angle-Sheath-Protector/dp/B00BKNPD1W/ref=sr_1_7?s=pc&ie=UTF8&qid=1366776461&sr=1-7";
//url[index++] = "http://www.amazon.com/CrazyOnDigital-Leather-Charger-Protector-Samsung/dp/B0083XTNJK/ref=sr_1_12?s=pc&ie=UTF8&qid=1366776461&sr=1-12";
//url[index++] = "http://www.amazon.com/ArmorSuit-MilitaryShield-Protector-Lifetime-Replacements/dp/B00CA9I3LC/ref=sr_1_8?s=pc&ie=UTF8&qid=1366776459&sr=1-8";
//url[index++] = "http://www.amazon.com/Sennheiser-HD-280-Pro-Headphones/dp/B000065BPB/ref=sr_1_17?s=musical-instruments&ie=UTF8&qid=1362772852&sr=1-17";
//url[index++] = "http://www.amazon.com/Samsung-Galaxy-Screen-Protector-GTP7510/dp/B005593W10/ref=sr_1_7?s=pc&ie=UTF8&qid=1366776462&sr=1-7";

var fin = require('fs');
var instream = fin.open("../../crawler/test_unseen.txt", "r");

while (!instream.atEnd())
	url[index++] = instream.readLine();

var fs = require('fs');
fs.write("output_unseen.txt", '', 'w');	//remove this when features are to be obtained from multiple pages
fs.write("grmm_unseen.txt", '', 'w');
fs.write("rel_unseen.txt", '', 'w');
fs.write("content_unseen.txt", '', 'w');

index = -1;
var main_enabled = true;
var page = null;
var p = null;

var main = function() {
	console.log("\nstarted processing page " + (index + 1) + ": " + url[index]);
	
	page = require('webpage').create();
	p = require('webpage').create();

	page.onConsoleMessage = function(msg) {
	    if (msg.substring(0,5) === 'grmm:') {
	    	fs.write("grmm_unseen.txt", msg.substring(5), 'a');
	        fs.write("grmm_unseen.txt", '\n', 'a');
	    } 
	    else if (msg.substring(0,4) === 'rel:') {
	    	var endIndex = msg.length - 1; //remove trailing comma
	    	fs.write("rel_unseen.txt", msg.substring(4, endIndex), 'a');
	        fs.write("rel_unseen.txt", '\n', 'a');
	    }
	    else if (msg.substring(0,8) === 'content:') {
	    	fs.write("content_unseen.txt", msg.substring(8), 'a');
	        fs.write("content_unseen.txt", '\n', 'a');
	    }
	    else {
	    	console.log(msg);
	    	fs.write("output_unseen.txt", msg, 'a');
	        fs.write("output_unseen.txt", '\n', 'a');
	    }
	};

	p.onConsoleMessage = function(msg) {
		console.log(msg);
	};

	var serviceResponse;
	
	page.onCallback = function(arg) {
		if (arg === 'mmd')
			return serviceResponse;
		if (arg === 'url')
			return url[index];
		if (arg === 'main') {
			main_enabled = true;
		}
	};
	
	//var serviceURL = "http://ecology-service.cse.tamu.edu/BigSemanticsService/mmd.json?url=" + encodeURIComponent(url[index]);
	var serviceURL = "http://localhost/BigSemanticsService/mmd.json?url=" + encodeURIComponent(url[index]);
	
	p.open(serviceURL, function(status) {
		if (status === "success") {
			console.log("success");
			serviceResponse = p.plainText;	
		}
	});
	
	page.open(url[index], function(status) {
	    if ( status === "success" ) {
	    	//page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
	    	page.injectJs("dynaContent.js");
			page.injectJs("mmdDomHelper.js");
			page.injectJs("util.js");
			page.injectJs("featureExtractor.js");
			
			/**
			 * note: page.evaluate() is a sandboxed environment and thus requires function definitions to be present right there. 
			 */
			page.evaluate(function() {
				var url = window.callPhantom('url');

				var getMmdFromService = function() {
	               	rawExtraction = false;
	            	var mmd = window.callPhantom('mmd');
	            	return mmd;
	            }
				
				var extractData = function() {
					
					var labeledNodes = getLabeledNodesFromMetaMetadata(getMmdFromService());	                
		            addLabelsAndExtractFeatures(labeledNodes, document);
		            
		            console.log("\nfinished processing page: " + url);
		            console.log("grmm: "); //for blank line between pages
					console.log("rel: ,"); //as other rel strings have an extra comma in the end
		            window.callPhantom('main');
				};
				
				if (performAction(url)) {
					waitForContent(extractData);
				} else {
					extractData();
				}
				
			});
	    }
	});
};

var interval_cnt = 0;
var process_interval = setInterval(function() {
	//console.log(main_enabled);
	if(main_enabled) {
		main_enabled = false;
		
		if (++index >= 1/*url.length*/) {
			clearInterval(process_interval);
			phantom.exit();
		} else {
			if (page !== null) page.close();
			if (p !== null) p.close();
			main();
		}
	} else {
		// to skip over some page that hangs forever
		if (++interval_cnt >= 20) {
			interval_cnt = 0;
			main_enabled = true;
		}
	}
}, 1000);