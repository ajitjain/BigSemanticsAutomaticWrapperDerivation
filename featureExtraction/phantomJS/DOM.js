/**
 * feature extraction code
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

page.onCallback = function() {
	return serviceResponse;
}

/**
 * note: page.evaluate() is a sandboxed environment and thus requires function definitions to be present right there. 
 */
page.open(url, function(status) {
    if ( status === "success" ) {
    	page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
            page.evaluate(function() {
            	
            	//note: offsetxxx and getComputedStyle are not w3c; these have been used to get rendered position, size
            	//font, color if same is not available through the style (also see, http://caniuse.com/getcomputedstyle).
            	
            	var textNodeType = 3, commentNodeType = 8;			//http://www.w3schools.com/htmldom/dom_properties.asp
            	
            	var nameArr = new Array();
            	var regionArr = new Array();
            	var colorArr = new Array();
            	var elemIndex = 0;
            	
            	var labeledNodeArr = new Array();
            	var labeledNodeArrIndex = 0;
            	
            	var getPosition = function(elt) {
                	//a top-down recursion was not convenient as several nested elements have same offsetParent
                	var x = 0, y = 0;
                	while (elt && (typeof elt.offsetLeft !== "undefined") && (typeof elt.offsetTop !== "undefined") &&
                							!isNaN(elt.offsetLeft) && !isNaN(elt.offsetTop))
                	{
                		x += elt.offsetLeft - elt.scrollLeft;
                		y += elt.offsetTop - elt.scrollTop;
                		elt = elt.offsetParent;
                	}
                	return {left: x, top: y};
                }            	
            	
            	//remove function arguments x, y later as position now is being calculated bottom-up
                var getTreeDepthAndLocalFeatures = function(root, x, y) {
                	console.log("");
                	
                	for (var i = 0; i < labeledNodeArrIndex; i++) {
                		if (equals(labeledNodeArr[i].node, root)) {
                			console.log("labeled: " + labeledNodeArr[i].label);
                			break;
                		}
                	}
                	
                	var bgcolor = "", border = "", margin = "",	padding = "";
		        	if (typeof root.style !== "undefined") {
		        		bgcolor = root.style.backgroundColor;
		        		if (bgcolor === "" /*&& window.getComputedStyle*/) {
		        			bgcolor = document.defaultView.getComputedStyle(root,null).getPropertyValue('background-color');
		        		}
		        		
		        		border = root.style.border;
		        		if (border === "" /*&& window.getComputedStyle*/) {
		        			borderObj = new Object();
		        			borderObj.topwidth = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-top-width');
		        			borderObj.bottomwidth = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-bottom-width');
		        			borderObj.leftwidth = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-left-width');
		        			borderObj.rightwidth = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-right-width');
		        			borderObj.topcolor = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-top-color');
		        			borderObj.bottomcolor = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-bottom-color');
		        			borderObj.leftcolor = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-left-color');
		        			borderObj.rightcolor = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-right-color');
		        			borderObj.topstyle = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-top-style');
		        			borderObj.bottomstyle = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-bottom-style');
		        			borderObj.leftstyle = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-left-style');
		        			borderObj.rightstyle = document.defaultView.getComputedStyle(root,null).getPropertyValue('border-right-style');
		        			
		        			border = "{";
		        			for (prop in borderObj)
		        			{
		        				border += prop + ': ' + borderObj[prop] + ' ';
		        			}
		        			border += "}";
		        		}
		        		
		        		margin = root.style.margin;
		        		if (margin === "" /*&& window.getComputedStyle*/) {
		        			marginObj = new Object();
		        			marginObj.top = document.defaultView.getComputedStyle(root,null).getPropertyValue('margin-top');
		        			marginObj.bottom = document.defaultView.getComputedStyle(root,null).getPropertyValue('margin-bottom');
		        			marginObj.left = document.defaultView.getComputedStyle(root,null).getPropertyValue('margin-left');
		        			marginObj.right = document.defaultView.getComputedStyle(root,null).getPropertyValue('margin-right');
		        			
		        			margin = "{";
		        			for (prop in marginObj)
		        			{
		        				margin += prop + ': ' + marginObj[prop] + ' ';
		        			}
		        			margin += "}";
		        		}
		        		
		        		padding = root.style.padding;
		        		if (padding === "" /*&& window.getComputedStyle*/) {
		        			paddingObj = new Object();
		        			paddingObj.top = document.defaultView.getComputedStyle(root,null).getPropertyValue('padding-top');
		        			paddingObj.bottom = document.defaultView.getComputedStyle(root,null).getPropertyValue('padding-bottom');
		        			paddingObj.left = document.defaultView.getComputedStyle(root,null).getPropertyValue('padding-left');
		        			paddingObj.right = document.defaultView.getComputedStyle(root,null).getPropertyValue('padding-right');
		        			
		        			padding = "{";
		        			for (prop in paddingObj)
		        			{
		        				padding += prop + ': ' + paddingObj[prop] + ' ';
		        			}
		        			padding += "}";
		        		}
		        		
		        		console.log("node: " + root.nodeName + " bgcolor: " + bgcolor);
		        		console.log("node: " + root.nodeName + " border: " + border);
		        		console.log("node: " + root.nodeName + " margin: " + margin);
		        		console.log("node: " + root.nodeName + " padding: " + padding);
		        	}
		        		                	
		        	var pos = getPosition(root);
	                console.log("node: " + root.nodeName + 
	                					" x: " + pos.left + " y: " + pos.top + " w: " + root.offsetWidth + " h: " + root.offsetHeight);
	                
	                //relational features are based on the fact that they are positionally and visually closer
	                //in addition to these, their fontsize and depth relative to the maximum are also considered,
	                //along with the changes in features w.r.t. depth and changes in dom node names.
	                var bAddForRelationalFeatures = false;
	                var nodeName = root.nodeName.toLowerCase();
	                if ((root.offsetWidth != 0 || root.offsetHeight != 0) && 
	                		(nodeName !== "html" && nodeName !== "body" && nodeName !== "strong" && nodeName !== "span"
	                			&& nodeName !== "pre")) { //restore span?
	                	bAddForRelationalFeatures = true;
		                nameArr[elemIndex] = root.nodeName;
		                regionArr[elemIndex] = {x:pos.left, y:pos.top, w:root.offsetWidth, h:root.offsetHeight};
		                colorArr[elemIndex] = {bg:bgcolor};
	                }
	
	                var children = root.childNodes;
	                
	                //word count for leaf nodes; condition helps in keeping the parent nodeName (a, h2, etc.)
	                for (var i = 0; i < children.length; i++) {
		                if (children[i].childNodes.length === 0 && children[i].nodeType !== commentNodeType) {
		                   	var text = children[i].data;
		                    if (typeof text !== "undefined" && text.replace(/^\s+|\s+$/g, "").length > 0) {
		                    	var fontsize = root.style.fontSize;
		                    	if (fontsize === "" /*&& window.getComputedStyle*/) {
		                    		fontsize = document.defaultView.getComputedStyle(root,null).getPropertyValue('font-size');
		                    	}
		                    	
		                    	var color = root.style.color;
		                    	if (color === "" /*&& window.getComputedStyle*/) {
		                    		color = document.defaultView.getComputedStyle(root,null).getPropertyValue('color');
		                    	}
		                    	
		                    	console.log("	text node: " + root.nodeName + " text: " + text + 
		                    													" fontSize: " + fontsize + " color: " + color);
		                    	
		                    	//later make the variable false to avoid unnecessary overwrites of same information?
		                    	if (bAddForRelationalFeatures)
		                    		colorArr[elemIndex] = {bg:bgcolor, fg:color};
		                    }
		                }
	                }
	                if (bAddForRelationalFeatures)
	                	elemIndex++;
	                
	                var treeDepth = 0;
	                if (children.length !== 0) {
	                    for (var i = 0; i < children.length; i++) {
	                    	if (children[i].nodeType !== textNodeType && children[i].nodeType !== commentNodeType) {
		                    	var currdepth = 1 + getTreeDepthAndLocalFeatures(children[i], 0, 0);
		                        //console.log("tree depth at node " + children[i].nodeName + " : " + currdepth);
		                        if (currdepth > treeDepth) {
		                          	treeDepth = currdepth;
		                        }
	                    	}
	                    }
	                }
	                return treeDepth;
                }
                
                var calculateRelationalFeatures = function() {
                	console.log("");
                	console.log("Relational features :: num regions: " + regionArr.length + "," + colorArr.length);
                	 
                	var POSITION_THRESHOLD = 150; //divide this into top-left, bottom-right, and hori-vert centers?
                	var SIZE_THRESHOLD = 300;	  //what would be a good value for this?
                	var COLOR_THRESHOLD = 128;    //separate this into bgcolor and fgcolor
                	
                	var len = regionArr.length;                	
                	for (var i = 0; i < len; i++) {
                		for (var j = (i+1); j < len; j++) {
                			//don't consider container relationships
                			//other direction needed as html tag violates top-down dimension values
                			if ((regionArr[i].x <= regionArr[j].x && regionArr[i].y <= regionArr[j].y &&
                					regionArr[i].w >= regionArr[j].w && regionArr[i].h >= regionArr[j].h) ||
                				(regionArr[i].x >= regionArr[j].x && regionArr[i].y >= regionArr[j].y &&
                        			regionArr[i].w <= regionArr[j].w && regionArr[i].h <= regionArr[j].h))
                				continue;
                			
                			//position
                			if (Math.abs(regionArr[i].x - regionArr[j].x) >= POSITION_THRESHOLD ||
                					Math.abs(regionArr[i].y - regionArr[j].y) >= POSITION_THRESHOLD)
                				continue;
                			
                			//size
                			if (Math.abs(regionArr[i].w - regionArr[j].w) >= SIZE_THRESHOLD ||
                					Math.abs(regionArr[i].h - regionArr[j].h) >= SIZE_THRESHOLD)
                				continue;
                			
                			//rgba?
                			var rgb1 = colorArr[i].bg.match(/(\d+)/g);
                			var rgb2 = colorArr[i].bg.match(/(\d+)/g);
                			if (Math.abs(rgb1[0] - rgb2[0]) >= COLOR_THRESHOLD || Math.abs(rgb1[1] - rgb2[1]) >= COLOR_THRESHOLD || 
                					Math.abs(rgb1[2] - rgb2[2]) >= COLOR_THRESHOLD)
                				continue;
                			
                			if (typeof colorArr[i].fg !== "undefined" && typeof colorArr[j].fg !== "undefined") {
                				var rgbA = colorArr[i].fg.match(/(\d+)/g);
                    			var rgbB = colorArr[i].fg.match(/(\d+)/g);
                    			if (Math.abs(rgbA[0] - rgbB[0]) >= COLOR_THRESHOLD || Math.abs(rgbA[1] - rgbB[1]) >= COLOR_THRESHOLD || 
                    					Math.abs(rgbA[2] - rgbB[2]) >= COLOR_THRESHOLD)
                    				continue;
                			}
                			
                			//print, if related
                			console.log("");
                			console.log("related: " + "node " + nameArr[i] + " & node " + nameArr[j]);
                			console.log("node " + nameArr[i] + " x: " + regionArr[i].x + " y: " + regionArr[i].y 
                							+ " w: " + regionArr[i].w + " h: " + regionArr[i].h 
                								+ " bg: " + colorArr[i].bg + " fg: " + colorArr[i].fg);
                			console.log("node " + nameArr[j] + " x: " + regionArr[j].x + " y: " + regionArr[j].y 
        									+ " w: " + regionArr[j].w + " h: " + regionArr[j].h 
        										+ " bg: " + colorArr[j].bg + " fg: " + colorArr[j].fg);
                		}
                	}
                }
                                
                /* largely from mmdDomHelper.js */
                var defVars = {};
                var doc = document;
                var currentMMDField;
                var rawExtraction = true;
                
                var getMmdFromService = function(callback) {
                	
                	rawExtraction = false;
                	var mmd = window.callPhantom();
                	
                	callback(mmd);
                }
                
                var recursivelyExtractNodes = function(mmd, contextNode, metadata, fieldParserContext) {
                   	if (metadata == undefined || metadata == null)
                        metadata = { }; // Output, should happen only the first time.
                	
                    if (mmd.kids == null || mmd.kids.length == 0) {
//                        console.log("\t\tMMD has no kids: " + mmd.name);
                        return null; // Nothing to do here.
                    }
                    
                    if (contextNode == undefined || contextNode == null)
                        contextNode = doc;

                    for (var mmdFieldIndex = 0; mmdFieldIndex < mmd.kids.length; mmdFieldIndex++) {
                        var mmdField = mmd.kids[mmdFieldIndex];
                        currentMMDField = mmdField;
                		//console.log("Iterating to Next mmdField");
                		//console.log(mmdField);
                        
                        var defVarNode;
                        if (mmdField.scalar != null) {
                			//console.log("recursivelyExtractMetadata(): Setting scalar: " + mmdField.scalar.name);
                            if (mmdField.scalar.hasOwnProperty('context_node')) {
                                defVarNode = defVars[mmdField.scalar.context_node];
                                if (defVarNode)
                                    contextNode = defVarNode;
                            }
                            extractScalar(mmdField.scalar, contextNode, metadata, fieldParserContext);
                        }
                        
                        if (mmdField.collection != null) {
                			//console.log("recursivelyExtractMetadata(): Setting Collection: " + mmdField.collection.name);
                            if (mmdField.collection.hasOwnProperty('context_node')) {
                                defVarNode = defVars[mmdField.collection.context_node];
                                if (defVarNode)
                                    contextNode = defVarNode;
                            }
                            extractCollection(mmdField.collection, contextNode, metadata, fieldParserContext);
                        }
                        
                        if (mmdField.composite != null) {
                			//console.log("recursivelyExtractMetadata(): Setting Composite: " + mmdField.composite.name);
                            if (mmdField.composite.hasOwnProperty('context_node')) {
                                defVarNode = defVars[mmdField.composite.context_node];
                                if (defVarNode)
                                    contextNode = defVarNode;
                            }
                            extractComposite(mmdField.composite, contextNode, metadata, fieldParserContext);
                        }

                		//console.log("Recursive extraction result: ");
                		//console.info(metadata);
                    }
                    
                	//console.log("Returning Metadata: ");
                	//console.info(metadata);
                    return metadata;
                }

                var extractScalar = function(mmdScalarField, contextNode, metadata, fieldParserContext) {
                    var xpathString = mmdScalarField.xpath;
                    var fieldParserKey = mmdScalarField.field_parser_key;

                    var stringValue = null;
                    
                    if (xpathString != null && xpathString.length > 0 && contextNode != null && fieldParserKey == null) {
                         var node = getScalarWithXPath(contextNode, xpathString);
                         stringValue = node.stringValue;
                         labeledNodeArr[labeledNodeArrIndex++] = {node:node, label:mmdScalarField.name, value:stringValue};
                         console.log("node: " + node + " label: " + mmdScalarField.name + " value: " + stringValue + " xpath: " + xpathString);
                    } else if (fieldParserKey != null) {
                        stringValue = getFieldParserValueByKey(fieldParserContext, fieldParserKey);
                    }

                    if (stringValue) {
                        stringValue = stringValue.replace(new RegExp('\n', 'g'), "");
                        stringValue = stringValue.trim();
                        if (mmdScalarField.filter != null)
                        {
                            var regex = mmdScalarField.filter.regex;
                            var replace = mmdScalarField.filter.replace;
                            if (replace != undefined && replace != null) // We must replace all newlines if the replacement is not a empty character
                            {
                                stringValue = stringValue.replace(new RegExp(regex, 'g'), replace);
                            }
                            else
                            {
                                var grps = stringValue.match(new RegExp(regex));
                                if (grps != null && grps.length > 0)
                                    stringValue = grps[grps.length - 1];
                            }
                        }

                        if(rawExtraction) {  
                        	if (mmdScalarField.tag != null && mmdScalarField.tag != mmdScalarField.name)
                            	metadata[mmdScalarField.tag] = stringValue;
                       		else
                            	metadata[mmdScalarField.name] = stringValue;
                        }
                        else {        
                    		mmdScalarField.value = stringValue;
                    	
                       		if (mmdScalarField.tag != null && mmdScalarField.tag != mmdScalarField.name)
                            	metadata[mmdScalarField.tag] = mmdScalarField;
                       		else
                           		metadata[mmdScalarField.name] = mmdScalarField;
                       }
                    }
                }

                var extractCollection = function(mmdCollectionField, contextNode, metadata, fieldParserContext) {
                    if (contextNode == null)
                        return false;
//                    console.log("extractCollection(): " + mmdCollectionField.name);

//                    console.log("DEBUG: calling field parser helper");
                    var fieldParserHelper = extractFieldParserHelperObject(mmdCollectionField, contextNode, fieldParserContext, 'collection');
                    if (fieldParserHelper == null)
                        return false;
//                    console.log("fieldParserHelper obtained: " + fieldParserHelper);

                    // nodeList is a XPathResult type, access items with snapshotItem(index)
                    // var nodeList = getNodeListWithXPath(contextNode, mmdCollectionField.xpath);
                    var nodeList = fieldParserHelper.nodeList;
                    var fieldParserContextList = fieldParserHelper.fieldParserContextList;
                    var size = fieldParserHelper.size;

                    if (mmdCollectionField.parse_as_hypertext == true || mmdCollectionField.child_type == "hypertext_para") {
                        // Special field, for now. Parser needs to change it's ways to handle hypertext
                        parseNodeListAsHypertext(mmdCollectionField, nodeList, metadata);
                        return true; // This collection is special. No further normal processing required.
                    }

                    var elements = [];
                    for (var i = 0; i < size; ++i) {
//                        console.log("\tCollection Result Index: " + i);
                        var thisNode = (nodeList == undefined || nodeList == null) ? null : nodeList.snapshotItem(i);
                        var thisFieldParserContext = (fieldParserContextList == undefined || fieldParserContextList == null) ? null : fieldParserContextList[i];
                        if (mmdCollectionField.childScalarType) { // collection of scalars
                            var value = null;
                            if (thisFieldParserContext)
                                value = getFieldParserValueByKey(thisFieldParserContext, '$0'); // $0 is the default key for regex_split
                            else
                                value = thisNode.textContent;

                            if (value)
                                elements.push(value);
                        } else { // collection of elements
                            var kids = mmdCollectionField.kids;
                            if (kids == undefined || kids == null || kids.length == 0) {
                				//console.log("Oops, collection fields do not exist.");
                            }
                            else {
                                var element = { };
                                element = recursivelyExtractNodes(mmdCollectionField.kids[0].composite, thisNode, element, thisFieldParserContext);

                                var newElement = clone(element);
                                	
                                if (!isEmpty(newElement))
                                    elements.push(newElement);
                            }
                        }
                    }

                    if (elements.length > 0) 
                    {
                        var extractedCollection = {};
                        //console.log("Metadata Collection: ");
                        //console.info(elements);
                        
                        extractedCollection[mmdCollectionField.child_type] = elements;
                        
                		if(rawExtraction) {
                        	metadata[mmdCollectionField.name] = extractedCollection;
                        }
                        else {
                        	mmdCollectionField.value = extractedCollection;
                        	metadata[mmdCollectionField.name] = mmdCollectionField;
                        }
                        
                    }
                    else {
                		//console.info("empty collection, not adding the object");
                    }

                    return true;
                }

                var extractComposite = function(mmdCompositeField, contextNode, metadata, fieldParserContext)
                {
                    if (contextNode == null)
                        return false;
//                    console.log("extractComposite(): " + mmdCompositeField.name);

//                    console.log("DEBUG: calling field parser helper");
                    var fieldParserHelper = extractFieldParserHelperObject(mmdCompositeField, contextNode, fieldParserContext, 'composite');
                    if (fieldParserHelper == null)
                        return false;
//                    console.log("fieldParserHelper obtained: " + fieldParserHelper);

                    // Apply xpath of composite node if it exists
                    // if (mmdCompositeField.xpath != null)
                    //    newContextNode = getNodeWithXPath(contextNode, mmdCompositeField.xpath);
                    var thisNode = fieldParserHelper.node;
                    var thisFieldParserContext = fieldParserHelper.fieldParserContext;

                    if (mmdCompositeField.parse_as_hypertext == true || mmdCompositeField.type == "hypertext_para") {
                        var paraNode = getNodeWithXPath(contextNode, mmdCompositeField.xpath);
                        var parsedPara = parseHypertextParaFromNode(paraNode);
                        
                        if(rawExtraction) {
                        	metadata[mmdCompositeField.name] = parsedPara;
                        }
                        else {
                        	mmdCompositeField.value = parsedPara;
                        	metadata[mmdCompositeField.name] = mmdCompositeField;
                        }
                        return true;
                    }
                    
//                    console.log("Composite Recursive call: ");
//                    console.info(mmdCompositeField);

                    var compositeMetadata = { };
                    compositeMetadata = recursivelyExtractNodes(mmdCompositeField, thisNode, compositeMetadata, thisFieldParserContext);

                    if (!isEmpty(compositeMetadata)) {
                        if (mmdCompositeField.hasOwnProperty('mm_name'))
                            compositeMetadata['mm_name'] = mmdCompositeField.mm_name;
//                        console.log("Composite Recursive Result ---------- : ");
//                        console.info(compositeMetadata);

                		if(rawExtraction) {
                        	metadata[mmdCompositeField.name] = compositeMetadata;
                        }
                        else {
                        	mmdCompositeField.value = compositeMetadata
                        	metadata[mmdCompositeField.name] = mmdCompositeField;
                        }
                    } else {
//                        console.log("Composite Extraction is empty");
                    }

                    return true;
                }

                var extractFieldParserHelperObject = function(mmdNestedField, contextNode, fieldParserContext, fieldType) {
                    var fieldParserHelper = { };
                    
                    // get xpath, context node, field parser defintion & key: basic information for following
                    var xpathString = mmdNestedField['xpath'];
                    var fieldParserElement = mmdNestedField['field_parser'];
                    var fieldParserKey = mmdNestedField['field_parser_key'];
                    
                    if (mmdNestedField.meta_metadata != null) {
//                        console.log("This is a meta_metadata: " + mmdNestedField);
                        fieldParserHelper.node = contextNode;
                        return fieldParserHelper;
                    }

                    if (xpathString != null && contextNode != null) {
                        if (fieldType == 'composite') {
                            fieldParserHelper.node = getNodeWithXPath(contextNode, xpathString);
                            fieldParserHelper.size = 1;
                        } else if (fieldType == 'collection') {
                            fieldParserHelper.nodeList = getNodeListWithXPath(contextNode, xpathString);
                            fieldParserHelper.size = fieldParserHelper.nodeList.snapshotLength;
                        }
                    }

                    if (fieldParserElement != null) {
                        var fieldParser = getFieldParserFactory()[fieldParserElement.name];
                        if (fieldParser != null) {
                            if (fieldType == 'composite') { // composite field
                                var valueString = null;
                                if (fieldParserKey != null && fieldParserKey.length > 0)
                                    valueString = getFieldParserValueByKey(fieldParserContext, fieldParserKey);
                                else if (fieldParserHelper.node != null)
                                    valueString = fieldParserHelper.node.getTextContent();
                                if (valueString != null && valueString.length > 0)
                                    fieldParserHelper.fieldParserContext = fieldParser.getKeyValuePairResult(fieldParserElement, valueString.trim());
                            } else if (fieldType == 'collection') { // collection field
                                if (mmdNestedField.child_scalar_type == null && fieldParserElement.for_each_element == 'True') { // collection of elements
                                    fieldParserHelper.fieldParserContextList = [];
                                    for (var i = 0; i < fieldParserHelper.size; ++i) {
                                        var node = fieldParserHelper.nodeList.snapshotItem(i);
                                        valueString = node.textContent;
                                        if (valueString != null && valueString.length > 0) {
                                            var aContext = fieldParser.getKeyValuePairResult(fieldParserElement, valueString.trim());
                                            fieldParserHelper.fieldParserContextList.push(aContext);
                                        }
                                    }
                                } else { // collection of scalars
                                    valueString = null;
                                    if (fieldParserKey != null && fieldParserKey.length > 0)
                                        valueString = getFieldParserValueByKey(fieldParserContext, fieldParserKey);
                                    else if (fieldParserHelper.nodeList != null && fieldParserHelper.size >= 1)
                                        valueString = fieldParserHelper.nodeList.snapshotItem(0).textContent;
                                    if (valueString != null && valueString.length > 0)
                                        fieldParserHelper.fieldParserContextList = fieldParser.getCollectionResult(fieldParserElement, valueString.trim());
                                }
                            }
                        }
                    }

                    if (fieldParserHelper.node == null && fieldParserHelper.nodeList == null && fieldParserHelper.fieldParserContext == null && fieldParserHelper.fieldParserContextList == null)
                        return null;
                    return fieldParserHelper;
                }

                var getFieldParserValueByKey = function(fieldParserContext, fieldParserKey) {
                    var pos = fieldParserKey.indexOf('|');
                    if (pos < 0)
                        return fieldParserContext[fieldParserKey];
                    var keys = fieldParserKey.split('|');
                    for (var key in keys)
                        if (fieldParserContext.hasOwnProperty(key))
                            return fieldParserContext[key];
                    return null;
                }

                var parseNodeListAsHypertext = function(mmdCollectionField, paras, metadata) {

//                    console.log("Found hypertext nodes: ");
//                    console.info(paras);

                    var parsedParas = [];

                    for (var resultIndex = 0; resultIndex < paras.snapshotLength; resultIndex++) {

                        var hypertextNode = paras.snapshotItem(resultIndex);
                        //console.log("Current Paragraph parsed: ");
                        //console.info(hypertextNode);
                        //console.log("Number of childNodes : " + hypertextNode.childNodes.length);

                        var paraContainer = {};
                        paraContainer[mmdCollectionField.child_type] = parseHypertextParaFromNode(hypertextNode);

                        
                        //console.info(hypertextPara);
                        parsedParas.push(paraContainer);
                    }
//                    console.info(parsedParas);

                    metadata[mmdCollectionField.name] = parsedParas;
                }

                var parseHypertextParaFromNode = function(hypertextNode) {

                    //internal functions
                    var getLinkRun = function(node) {
                        var link_run = {};
                        link_run["text"] = node.textContent;
                        link_run["location"] = node.href;
                        link_run["title"] = node.title; //Wiki specific !
                        return link_run;
                    }
                    var getTextRun = function(node, formattedRun) {
                        var text_run = formattedRun == null ? {} : formattedRun;
                        text_run.text = node.textContent;
                        return text_run;
                    }

                    var hypertextPara = {};
                    runs = [];
                    hypertextPara["runs"] = runs;

                    for (var nodeNum = 0; nodeNum < hypertextNode.childNodes.length; nodeNum++) {
                        var curNode = hypertextNode.childNodes[nodeNum];
                        var nodeName = curNode.nodeName;
                        //console.info(curNode);
                        var resNode = {};
                        if (nodeName == "#text" || nodeName == "SPAN") {
                            //console.log("Text: " + curNode.textContent);
                            resNode["text_run"] = getTextRun(curNode);

                        }
                        else if (nodeName == "A") {
                            //No further parsing just pull values out.
                            resNode["link_run"] = getLinkRun(curNode);
                        }
                        else if (nodeName == "B") {
                            formattedRun = {};
                            var styleInfo = { };

                            styleInfo["bold"] = true;
                            formattedRun["style_info"] = styleInfo;
                            if (curNode.childElementCount == 0) {
                                resNode["text_run"] = getTextRun(curNode, formattedRun);
                                //console.log("Simple bold : " + curNode.text);
                            }
                            else {
//                                console.log("Bold link ?");
                                //console.log("NestedBold: ");
                                //console.info(curNode);
                            }
                        }
                        else if (nodeName == "I") {
                            formattedRun = {};
                            var styleInfo = { };
                            styleInfo["italics"] = true;
                            formattedRun["style_info"] = styleInfo;
                            resNode["text_run"] = getTextRun(curNode, formattedRun);
                        }
                        else {
//                            console.log("IgnoredNode: ");
//                            console.info(curNode);
                        }
                        if (!isEmpty(resNode))
                            runs.push(resNode);
                    }
                    return hypertextPara;
                }

                // Util functions, to make the above functions a little prettier

                var isEmpty = function(obj) {
                    for (var propName in obj)
                        if (obj.hasOwnProperty(propName))
                            return false;
                    return true;
                }

                /**
                * All scalars can be considered strings. Type holds no value in javascript (yet).
                */
                var getScalarWithXPath = function(contextNode, xpath)
                {
                    return doc.evaluate(xpath, contextNode, null, XPathResult.STRING_TYPE, null);
                }

                /**
                * Uses getNodeListWithXPath, but verifies and returns only the first value.
                */
                var getNodeWithXPath = function(contextNode, xpath)
                {
                    var nodelist = getNodeListWithXPath(contextNode, xpath);
                    if (nodelist.snapshotLength == 0)
                        return null;
                    else
                        return nodelist.snapshotItem(0);
                    
                }

                var getNodeListWithXPath = function(contextNode, xpath) {
                    return doc.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

                }

                var clone = function(obj){
                    if(obj == null || typeof(obj) != 'object')
                        return obj;

                    var temp = obj.constructor(); // changed

                    for(var key in obj)
                        temp[key] = clone(obj[key]);
                    return temp;
                }

                var getMMDField = function(mmd, fieldName) {
                	for(i in mmd.kids) {
                		var mmdField = mmd.kids[i];
                		if (mmdField.scalar != null) {
                         	if(mmdField.scalar.name == fieldName)
                         		return mmdField.scalar;
                        }		
                	}
                }

                var getNodeCollectionFromMetaMetadata = function() {
                	getMmdFromService(function(response) {
                		var metadata = {};
                		console.log(response);
                		var obj = eval("(" + response + ")");
                		var mmd = obj.meta_metadata;
                		if(mmd.parser == "xpath")
                		{
                			if (mmd.hasOwnProperty('def_var')) {
                				for (var i = mmd.def_var.length - 1; i >= 0; i--) {
                					var thisvar = mmd.def_var[i];
                					//console.log("Setting def_var: " + thisvar.name);
                					if (thisvar.hasOwnProperty('type')) {
                						if(thisvar.type == "node") {
                							var result = getNodeWithXPath(doc, thisvar.xpath);
                							if(result) {
                								defVars[thisvar.name] = result;
                								//console.log("def_var Value: ");
                								//console.info(result);
                		                    }
                		                }
                		            }
                		        }
                	       }
                	
                		   metadata = recursivelyExtractNodes(mmd, doc, null, null);
                		   //console.info(metadata);
                		}
                		
                		/*if(rawExtraction) {
                	    	metadata['title'] = doc.title;	
                	    	metadata['location'] = doc.location.href;
                	    	//metadata['favicon'] = 
                	    }
                	    else {
                	    	var titleField = getMMDField(mmd, "title");
                	    	titleField.value = doc.title;
                	    	metadata['title'] = titleField;
                	    
                	    	var locationField = getMMDField(mmd, "location");
                	    	locationField.value = doc.location.href;
                	    	metadata['location'] = locationField;  
                	    }*/
                	    
                	    if (mmd.hasOwnProperty('mm_name'))
                			metadata['mm_name'] = mmd.mm_name;
                	
                		var metadataTag = mmd.hasOwnProperty('type') ? mmd.type : mmd.name;
                	    metadata['mm_name'] = metadataTag;

                	    return metadata;
                	});
                }
                
                /* from util.js */
                var equals = function(obj, x)
                {
                  for(var p in obj)
                  {
                      if (obj[p])
                      {
                      	if(x[p])
                      	{
                          switch(typeof(obj[p])) {
                              case 'object':
                                  if (!this.equals(obj[p], x[p])) { return false; } break;
                              case 'function':
                                  if (typeof(x[p])=='undefined' ||
                                      (p != 'equals' && obj[p].toString() != x[p].toString()))
                                      return false;
                                  break;
                              default:
                                  if (obj[p] != x[p]) { return false; }
                          }
                        }
                        else
                        {
                        	return false;
                        }
                      }
                      else
                      {
                          if (x[p])
                              return false;
                      }
                  }
                  return true;
                }
                
                getNodeCollectionFromMetaMetadata();
  
                console.log("DOM Tree Depth: " + getTreeDepthAndLocalFeatures(document.documentElement, 
                								document.documentElement.offsetLeft, document.documentElement.offsetTop));
                calculateRelationalFeatures();
            });
            phantom.exit();
        });
    }
});
