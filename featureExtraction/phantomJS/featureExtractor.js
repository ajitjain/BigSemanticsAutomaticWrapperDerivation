/**
 * feature extraction code
 * @author ajit
 */

	//note: offsetxxx and getComputedStyle are not w3c; these have been used to get rendered position, size
	//font, color if same is not available through the style (also see, http://caniuse.com/getcomputedstyle).
	
	var textNodeType = 3, commentNodeType = 8;			//http://www.w3schools.com/htmldom/dom_properties.asp
	
	var nodeArr = new Array();		// for relational features
	var arrIndex = 0;
	
	var labeledNodeArr;				// passed in labeled nodes; extracted using mmd
	
	var maxWidth = 1, maxHeight = 1;
	
	var output = function(node, str) {
		var outputStr = "label:" + node.label + " id:" + str;
		//console.log(outputStr);
		
		if (node.label !== undefined) {
			var grmmStr = "grmm:" + node.label + " ----" + str;
			console.log(grmmStr);
		}
	};
		
	var featureStr = function(node) {
		var str = "";
		
		var hsv = node.bg;
		if (hsv[0] !== 0 || hsv[1] !== 0 || hsv[2] !== 0 || hsv[3] === undefined || hsv[3] !== 0) {
			str = " bgh:" + hsv[0] + " bgs:" + hsv[1] + " bgv:" + hsv[2];
		}
		
		if (node.fg !== undefined) {
			hsv = node.fg;
			str += " fgh:" + hsv[0] + " fgs:" + hsv[1] + " fgv:" + hsv[2];
		}
		
		str += " x:" + (node.x / maxWidth).toFixed(2) + " y:" + (node.y / maxHeight).toFixed(2) 
								+ " w:" + (node.w / maxWidth).toFixed(2) + " h:" + (node.h / maxHeight).toFixed(2);
		
		str += " aspectRatio:" + (node.w / node.h).toFixed(2);
		
		var borderObj = "", marginObj = "",	paddingObj = "";
		var root = node.node;
		borderObj = root.style.border;
		if (borderObj === "" /*&& window.getComputedStyle*/) {
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
			
//			border = "{";
//			for (prop in borderObj)
//			{
//				border += prop + ': ' + borderObj[prop] + ' ';
//			}
//			border += "}";
		}
		
		marginObj = root.style.margin;
		if (marginObj === "" /*&& window.getComputedStyle*/) {
			marginObj = new Object();
			marginObj.top = document.defaultView.getComputedStyle(root,null).getPropertyValue('margin-top');
			marginObj.bottom = document.defaultView.getComputedStyle(root,null).getPropertyValue('margin-bottom');
			marginObj.left = document.defaultView.getComputedStyle(root,null).getPropertyValue('margin-left');
			marginObj.right = document.defaultView.getComputedStyle(root,null).getPropertyValue('margin-right');
			
//			margin = "{";
//			for (prop in marginObj)
//			{
//				margin += prop + ': ' + marginObj[prop] + ' ';
//			}
//			margin += "}";
		}
		
		paddingObj = root.style.padding;
		if (paddingObj === "" /*&& window.getComputedStyle*/) {
			paddingObj = new Object();
			paddingObj.top = document.defaultView.getComputedStyle(root,null).getPropertyValue('padding-top');
			paddingObj.bottom = document.defaultView.getComputedStyle(root,null).getPropertyValue('padding-bottom');
			paddingObj.left = document.defaultView.getComputedStyle(root,null).getPropertyValue('padding-left');
			paddingObj.right = document.defaultView.getComputedStyle(root,null).getPropertyValue('padding-right');
			
//			padding = "{";
//			for (prop in paddingObj)
//			{
//				padding += prop + ': ' + paddingObj[prop] + ' ';
//			}
//			padding += "}";
		}
		
//		console.log("node: " + root.nodeName + " bgcolor: " + bgcolor);
//		console.log("node: " + root.nodeName + " border: " + border);
//		console.log("node: " + root.nodeName + " margin: " + margin);
//		console.log("node: " + root.nodeName + " padding: " + padding);
				
		if (borderObj.leftwidth !== '0px' || borderObj.rightwidth !== '0px' || 
			borderObj.topwidth !== '0px' || borderObj.bottomwidth !== '0px') {
			str += " blw:" + borderObj.leftwidth + " brw:" + borderObj.rightwidth 
				+ " btw:" + borderObj.topwidth + " bbw:" + borderObj.bottomwidth;
		}

		var rgb;
		if (borderObj.leftcolor !== undefined) {
			rgb = borderObj.leftcolor.match(/(\d+)/g);
			hsv = rgb2hsv(rgb[0], rgb[1], rgb[2]);
			str += " blch:" + hsv[0] + " blcs:" + hsv[1] + " blcv:" + hsv[2];
		}
		if (borderObj.rightcolor !== undefined) { 
			rgb = borderObj.rightcolor.match(/(\d+)/g);
			hsv = rgb2hsv(rgb[0], rgb[1], rgb[2]);
			str += " brch:" + hsv[0] + " brcs:" + hsv[1] + " brcv:" + hsv[2];
		}
		if (borderObj.topcolor !== undefined) {
			rgb = borderObj.topcolor.match(/(\d+)/g);
			hsv = rgb2hsv(rgb[0], rgb[1], rgb[2]);
			str += " btch:" + hsv[0] + " btcs:" + hsv[1] + " btcv:" + hsv[2];
		}
		if (borderObj.bottomcolor !== undefined) {
			rgb = borderObj.bottomcolor.match(/(\d+)/g);
			hsv = rgb2hsv(rgb[0], rgb[1], rgb[2]);
			str += " bbch:" + hsv[0] + " bbcs:" + hsv[1] + " bbcv:" + hsv[2];
		}
		
		if (borderObj.leftstyle !== 'none' || borderObj.rightstyle !== 'none' || 
				borderObj.topstyle !== 'none' || borderObj.bottomstyle !== 'none') {
			str += " bls:" + borderObj.leftstyle + " brs:" + borderObj.rightstyle 
				+ " bts:" + borderObj.topstyle + " bbs:" + borderObj.bottomstyle;
		}
		
		if (marginObj.left !== '0px' || marginObj.right !== '0px' || marginObj.top !== '0px' || marginObj.bottom !== '0px') {
			str += " ml:" + marginObj.left + " mr:" + marginObj.right + " mt:" + marginObj.top + " mb:" + marginObj.bottom;
		}
		
		if (paddingObj.left !== '0px' || paddingObj.right !== '0px' || paddingObj.top !== '0px' || paddingObj.bottom !== '0px') {
			str += " pl:" + paddingObj.left + " pr:" + paddingObj.right + " pt:" + paddingObj.top + " pb:" + paddingObj.bottom;
		}
		
		str += " height:" + node.height;
		
		if (node.fontsize !== undefined) {
			str += " font:" + node.fontsize + " wordcnt:" + node.wc
				+ " cPrice:" + node.cPrice + " cRating:" + node.cRating + " cReview:" + node.cReview;
		}
		
		if (root.nodeName.toLowerCase() === "img")
			str += " isImg:" + true;
			
		return str;
	};
	
	var isIncluded = function(nodeName) {
		return (nodeName === "p" || nodeName === "h1" || nodeName === "h2" || nodeName === "h3" || nodeName === "h4" ||
				nodeName === "h5" || nodeName === "h6" || nodeName === "blockquote" || nodeName === "a" ||
				nodeName === "img" || nodeName === "span" || nodeName === "ul" || nodeName === "ol" || nodeName === "li" ||
				nodeName === "dl" || nodeName === "dt" || nodeName === "dd" || nodeName === "td" || nodeName === "th" ||
				nodeName === "input" || nodeName === "textarea" || nodeName === "select" || nodeName === "option" ||
				nodeName === "button" || nodeName === "label" || nodeName === "fieldset" ||
				/* adding these for textnodeType as we would want to go further up */
				nodeName === "strong" || nodeName === "em" || nodeName === "pre" || nodeName === "tt" ||
			    nodeName === "span" || nodeName === "a" || nodeName === "sup" || nodeName === "sub" || 
			    nodeName === "b" || nodeName === "i" || nodeName === "big" || nodeName === "small");
	};
	
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
	};            	
	 
	var getTreeDepthAndLocalFeatures = function(root, label) {
		//console.log(root.nodeName);
		var nodeObj = new Object();
		nodeObj.node = root;
		//nodeObj.bExtractRelational = true; //false; //we are now dealing with formatters in another way
		
		var children = root.childNodes;
		var treeDepth = 0;
	    var nodeName = root.nodeName.toLowerCase();
	    
	    //the following list is of the elements that we dont want to traverse 
	    if (nodeName !== "head" && nodeName !== "script" && nodeName !== "style" &&	nodeName !== "noscript" && nodeName !== "br")
	    {
	    	//if only labeled nodes should be extracted move this block out to caller or make it an outer block
	    	var label_transition = false;
			nodeObj.label = label;
			if (label === 'other' && labeledNodeArr instanceof Array) {
				for (var i = 0; i < labeledNodeArr.length; i++) {
					if (/*equals*/(labeledNodeArr[i].node === root)) {
//						console.log("labeled: " + labeledNodeArr[i].label);
						nodeObj.label = labeledNodeArr[i].label;
						label_transition = true;
						break;
					}
				}
			}
			
			if (root.offsetWidth > maxWidth) maxWidth = root.offsetWidth;
			if (root.offsetHeight > maxHeight) maxHeight = root.offsetHeight;
			
			nodeObj.height = 0;
		    if (children.length !== 0) {
		        for (var i = 0; i < children.length; i++) {
		        	if (children[i].nodeType !== commentNodeType) {
		        		//if (nodeObj.label === 'description') console.log("alabel:" + nodeObj.label + " node:" + nodeName + " child:" + children[i].nodeName);
		            	var currdepth = 1 + getTreeDepthAndLocalFeatures(children[i], nodeObj.label);
//		                console.log("tree depth at node " + children[i].nodeName + " : " + currdepth);
		                if (currdepth > treeDepth) {
		                  	treeDepth = currdepth;
		                }
		                nodeObj.height = currdepth;
		        	}
		        }
		    }
		    
		    //if (nodeObj.label !== 'other') console.log("blabel:" + nodeObj.label + " node:" + nodeName + " include:" + root.include
		    	//	+ " " + label_transition + " " + root.offsetWidth + " " + root.offsetHeight);
		    
		    // we are only going to add visible leaf nodes 
		    if ((children.length === 0 || root.include === true) && root.offsetWidth !== 0 && root.offsetHeight !== 0) 
		    {
		    	//if (nodeObj.label !== 'other') console.log("in");
		       	var include = false;
		    	// for the nodes in list, we want to include parent instead; i.e. else if part is executed
		    	// text node gets checked with first condition; while the list is mostly for formatters of text node 
		    	if (root.nodeType !== textNodeType &&
		    		nodeName !== "strong" && nodeName !== "em" && nodeName !== "pre" && nodeName !== "tt" &&
			    	nodeName !== "span" && nodeName !== "a" && nodeName !== "sup" && nodeName !== "sub" && 
			    	nodeName !== "b" && nodeName !== "i" && nodeName !== "big" && nodeName !== "small") //restore span? 
		    	{ 
		    		//nodeObj.bExtractRelational = true;
			    	include = isIncluded(nodeName) || root.include;
			    	//if (nodeObj.label !== 'other') console.log("label:" + nodeObj.label + " node:" + nodeName + " include:" + include);
			    }
		    	else if (!label_transition) // not if the formatter happens to be a labeled node 
		    	{
			    	var parent_include = isIncluded(root.parentNode.nodeName.toLowerCase()); // as we dont want to reset parent accidently
			    	//if (nodeObj.label !== 'other') console.log(root.parentNode.nodeName.toLowerCase() + ":" +parent_include);
			    	
			    	if (parent_include && typeof root.parentNode.include === "undefined") {
			    		//if (nodeObj.label !== 'other') console.log("plabel:" + nodeObj.label + " node:" + nodeName);
			    		root.parentNode.include = true;
			    	}
			    	if (!parent_include) {
			    		//if (nodeObj.label !== 'other') console.log("ilabel:" + nodeObj.label + " node:" + nodeName);
			    		if (root.nodeType !== textNodeType)
			    			include = true;
			    		else
			    			root.parentNode.include = true;			    		
			    	}
			    }
		    	else // the element is a formatter but is a labeled item 
		    	{
		    		//if (nodeObj.label !== 'other') console.log("include: " + nodeName);
		    		include = true;
		    	}
		    	
			    if (include)
			    {		    	
					// first extract only those local features which are required for establishing relations 
					// and extract remaining at the starting of the relational features calculation
					var bgcolor = "";
					if (typeof root.style !== "undefined") {
						bgcolor = root.style.backgroundColor;
						if (bgcolor === "" /*&& window.getComputedStyle*/) {
							bgcolor = document.defaultView.getComputedStyle(root,null).getPropertyValue('background-color');
						}
					}
					// TODO: this condition added temporary for values like initial / transparent / inherit. 
					// should actually be obtained somehow
			    	if (bgcolor.substring(0,3) !== 'rgb')
			    		bgcolor = 'rgba(0, 0, 0, 0)';
			    	
			    	var rgb = bgcolor.match(/(\d+)/g);
					var pos = getPosition(root);
				
					nodeObj.x = pos.left; nodeObj.y = pos.top; nodeObj.w = root.offsetWidth; nodeObj.h = root.offsetHeight;
					nodeObj.bg = rgb2hsv(rgb[0], rgb[1], rgb[2]);
					//console.log("rgb:" + rgb + " hsv:" + nodeObj.bg);
								    	
	//			    console.log("node: " + root.nodeName + 
	//	    							" x: " + pos.left + " y: " + pos.top + " w: " + root.offsetWidth + " h: " + root.offsetHeight);
				    
				    //as we are already visiting text nodes for fgcolor, so also calculate
				    //word count and semantic properties simultaneously
				    for (var i = 0; i < children.length; i++) {
				    	//condition helps in keeping the parent nodeName (a, h2, etc.)
				        if (children[i].childNodes.length === 0 && children[i].nodeType !== commentNodeType) {
				        	var text = children[i].data;
				            if (typeof text !== "undefined") {
				            	var trimTxt = text.replace(/^\s+|\s+$/g, "");
				            	if (trimTxt.length > 0) {

				            		var fontsize = root.style.fontSize;
					            	if (fontsize === "" /*&& window.getComputedStyle*/) {
					            		fontsize = document.defaultView.getComputedStyle(root,null).getPropertyValue('font-size');
					            	}
					            	
					            	var color = root.style.color;
					            	if (color === "" /*&& window.getComputedStyle*/) {
					            		color = document.defaultView.getComputedStyle(root,null).getPropertyValue('color');
					            	}
					            	
					            	nodeObj.wc = trimTxt.match(/[^\s]+/g).length;
					            	nodeObj.cPrice = (trimTxt.search("price") >= 0 || trimTxt.search("Price") >= 0);
					            	nodeObj.cRating = (trimTxt.search("rating") >= 0 || trimTxt.search("Rating") >= 0);
					            	nodeObj.cReview = (trimTxt.search("review") >= 0 || trimTxt.search("Review") >= 0);		            	
					            	nodeObj.fontsize = fontsize;
	//				            	console.log("	text node: " + root.nodeName + " text: " + text + 
	//		            													" fontSize: " + fontsize + " color: " + color);
					            	
					            	//later make the variable false to avoid unnecessary overwrites of same information?
					            	//if (bAddForRelationalFeatures)
					            	var rgbfg = color.match(/(\d+)/g);
					            	if (color.substring(0,3) === 'rgb')
					            		nodeObj.fg = rgb2hsv(rgbfg[0], rgbfg[1], rgbfg[2]);
					            	//console.log("rgbf:" + rgbfg + " hsv:" + nodeObj.fg);
					            }
				            }
				        }
				    }				    
				    //console.log(arrIndex + ": " + nodeObj.label);
				    nodeArr[arrIndex++] = nodeObj;				    
			    }
		    }
	    }
	    return treeDepth;
	};
	
	//relational features are based on the fact that they are positionally and visually closer
    //in addition to these, their fontsize and depth relative to the maximum are also considered,
    //along with the changes in features w.r.t. depth and changes in dom node names.
	var calculateRelationalFeatures = function() {
//		console.log("");
//		console.log("Relational features :: num regions: " + regionArr.length + "," + colorArr.length);
	    		 
		var POSITION_THRESHOLD = 150; //divide this into top-left, bottom-right, and hori-vert centers?
		var SIZE_THRESHOLD = 300;	  //what would be a good value for this?
		//var COLOR_THRESHOLD = 128;    //separate this into bgcolor and fgcolor
		var HUE_THRESHOLD = 30; 		//degrees
		var SATURATION_THRESHOLD = 0.3;
		var VALUE_THRESHOLD = 0.4;
		
		var len = nodeArr.length;    
		//console.log("arrlen: " + len);
		for (var i = 0; i < len; i++) {
			var str = featureStr(nodeArr[i]);
			//console.log(i + ": " + nodeArr[i].label);
			//if (nodeArr[i].bExtractRelational) {
				//console.log(i + ": " + nodeArr[i].label);
				var relStr = 'rel:' + i + ":";
				var bRelated = false;
				var relx = 0, rely = 0, relw = 0, relh = 0, relbh = 0, relbs = 0, relbv = 0, relfh = 0, relfs = 0, relfv = 0;
				for (var j = (i+1); j < len; j++) {
					//console.log("new iteration: " + j);
					//if (nodeArr[j].bExtractRelational) {
					
						//don't consider container relationships
						//other direction needed as html tag violates top-down dimension values
						if ((nodeArr[i].x <= nodeArr[j].x && nodeArr[i].y <= nodeArr[j].y &&
								nodeArr[i].w >= nodeArr[j].w && nodeArr[i].h >= nodeArr[j].h) ||
							(nodeArr[i].x >= nodeArr[j].x && nodeArr[i].y >= nodeArr[j].y &&
									nodeArr[i].w <= nodeArr[j].w && nodeArr[i].h <= nodeArr[j].h))
							continue;
						
						//position
						if (Math.abs(nodeArr[i].x - nodeArr[j].x) >= POSITION_THRESHOLD ||
								Math.abs(nodeArr[i].y - nodeArr[j].y) >= POSITION_THRESHOLD)
							continue;
						
						//size
						if (Math.abs(nodeArr[i].w - nodeArr[j].w) >= SIZE_THRESHOLD ||
								Math.abs(nodeArr[i].h - nodeArr[j].h) >= SIZE_THRESHOLD)
							continue;
						
						//rgba?
						if (Math.abs(nodeArr[i].bg[0] - nodeArr[j].bg[0]) >= HUE_THRESHOLD 
								/*|| Math.abs(rgb1[1] - rgb2[1]) >= COLOR_THRESHOLD || Math.abs(rgb1[2] - rgb2[2]) >= COLOR_THRESHOLD*/)
							continue;
						
						if (typeof nodeArr[i].fg !== "undefined" && typeof nodeArr[j].fg !== "undefined") {
							if (Math.abs(nodeArr[i].fg[0] - nodeArr[j].fg[0]) >= HUE_THRESHOLD 
								/*|| Math.abs(rgbA[1] - rgbB[1]) >= COLOR_THRESHOLD || Math.abs(rgbA[2] - rgbB[2]) >= COLOR_THRESHOLD*/)
			    				continue;
						}
						
						// we are subtracting the diff from threshold to assign higher values to strongly related nodes 
						relx += (POSITION_THRESHOLD - Math.abs(nodeArr[i].x - nodeArr[j].x));
						rely += (POSITION_THRESHOLD - Math.abs(nodeArr[i].y - nodeArr[j].y));
						relw += (SIZE_THRESHOLD - Math.abs(nodeArr[i].w - nodeArr[j].w));
						relh += (SIZE_THRESHOLD - Math.abs(nodeArr[i].h - nodeArr[j].h));
						relbh += (HUE_THRESHOLD - Math.abs(nodeArr[i].bg[0] - nodeArr[j].bg[0]));
						relbs += (SATURATION_THRESHOLD - Math.abs(nodeArr[i].bg[1] - nodeArr[j].bg[1]));
						relbv += (VALUE_THRESHOLD - Math.abs(nodeArr[i].bg[2] - nodeArr[j].bg[2]));
						
						if (typeof nodeArr[i].fg !== "undefined" && typeof nodeArr[j].fg !== "undefined") {
							relfh += (HUE_THRESHOLD - Math.abs(nodeArr[i].fg[0] - nodeArr[j].fg[0]));
							relfs += (SATURATION_THRESHOLD - Math.abs(nodeArr[i].fg[1] - nodeArr[j].fg[1]));
							relfv += (VALUE_THRESHOLD - Math.abs(nodeArr[i].fg[2] - nodeArr[j].fg[2]));
						}
						
						relStr += j + ",";
						bRelated = true;
						//print, if related
		//				console.log("");
		//				console.log("related: " + "node " + nameArr[i] + " & node " + nameArr[j]);
		//				console.log("node " + nameArr[i] + " x: " + regionArr[i].x + " y: " + regionArr[i].y 
		//								+ " w: " + regionArr[i].w + " h: " + regionArr[i].h 
		//									+ " bg: " + colorArr[i].bg + " fg: " + colorArr[i].fg);
		//				console.log("node " + nameArr[j] + " x: " + regionArr[j].x + " y: " + regionArr[j].y 
		//								+ " w: " + regionArr[j].w + " h: " + regionArr[j].h 
		//									+ " bg: " + colorArr[j].bg + " fg: " + colorArr[j].fg);
					//}
				}
				if (relx > 0) str += " relx:" + relx;
				if (rely > 0) str += " rely:" + rely;
				if (relw > 0) str += " relw:" + relw;
				if (relh > 0) str += " relh:" + relh;
				if (relbh > 0) str += " relbgh:" + relbh;
				if (relbs > 0) str += " relbgs:" + relbs.toFixed(2);
				if (relbv > 0) str += " relbgv:" + relbv.toFixed(2);
				if (relfh > 0) str += " relfgh:" + relfh;
				if (relfs > 0) str += " relfgs:" + relfs.toFixed(2);
				if (relfv > 0) str += " relfgv:" + relfv.toFixed(2);
				
				if (bRelated)
					console.log(relStr);
			//}			
			output(nodeArr[i], str);
		}
	};
	
	var addLabelsAndExtractFeatures = function(labeledNodes, document) {
		
		labeledNodeArr = labeledNodes;
		
		console.log("DOM Tree Depth: " + getTreeDepthAndLocalFeatures(document.documentElement, 'other'));
		
		calculateRelationalFeatures();
	};