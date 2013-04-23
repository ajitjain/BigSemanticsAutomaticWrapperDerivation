/**
 * feature extraction code
 * @author ajit
 */


	//note: offsetxxx and getComputedStyle are not w3c; these have been used to get rendered position, size
	//font, color if same is not available through the style (also see, http://caniuse.com/getcomputedstyle).
	
	var textNodeType = 3, commentNodeType = 8;			//http://www.w3schools.com/htmldom/dom_properties.asp
	
	var nameArr = new Array();
	var regionArr = new Array();
	var colorArr = new Array();
	var elemIndex = 0;
	
	var labeledNodeArr;
	
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
		
		for (var i = 0; i < labeledNodeArr.length; i++) {
			if (/*equals*/(labeledNodeArr[i].node === root)) {
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
	
	var addLabelsAndExtractFeatures = function(labeledNodes, document) {
		
		labeledNodeArr = labeledNodes;
		
		console.log("DOM Tree Depth: " + getTreeDepthAndLocalFeatures(document.documentElement, 
				document.documentElement.offsetLeft, document.documentElement.offsetTop));
		
		calculateRelationalFeatures();
	}