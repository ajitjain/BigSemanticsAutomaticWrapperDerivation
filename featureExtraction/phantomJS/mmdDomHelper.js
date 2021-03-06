/**
 * @author 
 */

/* largely from plugin - mmdDomHelper.js */

	var labeledNodeArr = new Array();
    var labeledNodeArrIndex = 0;
	var attrNodeType = 2;
    
    var defVars = {};
    var doc = document;
    var currentMMDField;
    var rawExtraction = true;
    
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
    };

    var extractScalar = function(mmdScalarField, contextNode, metadata, fieldParserContext) {
    	//console.log("extractScalar: " + mmdScalarField.name);
    	
    	var xpathString = mmdScalarField.xpath;
        var fieldParserKey = mmdScalarField.field_parser_key;

        var stringValue = null;
        
        if (xpathString != null && xpathString.length > 0 && contextNode != null && fieldParserKey == null) {
             var node = getScalarWithXPath(contextNode, xpathString).singleNodeValue;
             if (node != null) {
            	 stringValue = node.textContent;
            	 if (node.nodeType == attrNodeType)
            		 node = node.ownerElement;
            	 labeledNodeArr[labeledNodeArrIndex++] = {node:node, label:mmdScalarField.name, value:stringValue};
                 //print(node);
                 console.log("content:node: " + node + " label: " + mmdScalarField.name + " value: " + stringValue + " xpath: " + xpathString);
             }                        
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
    };

    var extractCollection = function(mmdCollectionField, contextNode, metadata, fieldParserContext) {
        //console.log("extractCollection: " + mmdCollectionField.name);
    	if (contextNode == null)
            return false;

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
//                        console.log("\tparseAsHypertext");
            return true; // This collection is special. No further normal processing required.
        }

        var elements = [];
        //console.log("size: " + size);
        for (var i = 0; i < size; ++i) {
//                        console.log("\tCollection Result Index: " + i);
            var thisNode = (nodeList == undefined || nodeList == null) ? null : nodeList.snapshotItem(i);
            if (thisNode != null) {
    		    var stringValue = thisNode.textContent;
    		    labeledNodeArr[labeledNodeArrIndex++] = {node:thisNode, label:mmdCollectionField.name, value:stringValue};
    		    console.log("content:node: " + thisNode + " label: " + mmdCollectionField.name + " value: " + stringValue + " xpath: " + mmdCollectionField.xpath);
            }
            var thisFieldParserContext = (fieldParserContextList == undefined || fieldParserContextList == null) ? null : fieldParserContextList[i];
            if (mmdCollectionField.childScalarType) { // collection of scalars
            	//console.log("\tscalars");
                var value = null;
                if (thisFieldParserContext)
                    value = getFieldParserValueByKey(thisFieldParserContext, '$0'); // $0 is the default key for regex_split
                else
                    value = thisNode.textContent;

                if (value)
                    elements.push(value);
            } else { // collection of elements
            	//console.log("\telements");
                var kids = mmdCollectionField.kids;
                if (kids == undefined || kids == null || kids.length == 0) {
    				//console.log("Oops, collection fields do not exist.");
                }
                else {
                    var element = { };
                    //element = recursivelyExtractNodes(mmdCollectionField.kids[0].composite, thisNode, element, thisFieldParserContext);

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
    };

    var extractComposite = function(mmdCompositeField, contextNode, metadata, fieldParserContext)
    {
    	//console.log("extractComposite: " + mmdCompositeField.name);
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
        
        if (thisNode != null) {
		    var stringValue = thisNode.textContent;
		    labeledNodeArr[labeledNodeArrIndex++] = {node:thisNode, label:mmdCompositeField.name, value:stringValue};
		    console.log("content:node: " + thisNode + " label: " + mmdCompositeField.name + " value: " + stringValue + " xpath: " + mmdCompositeField.xpath);
        }

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
        //commented this as we are treating composites in entirety
        //compositeMetadata = recursivelyExtractNodes(mmdCompositeField, thisNode, compositeMetadata, thisFieldParserContext);

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
    };

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
    };

    var getFieldParserValueByKey = function(fieldParserContext, fieldParserKey) {
        var pos = fieldParserKey.indexOf('|');
        if (pos < 0)
            return fieldParserContext[fieldParserKey];
        var keys = fieldParserKey.split('|');
        for (var key in keys)
            if (fieldParserContext.hasOwnProperty(key))
                return fieldParserContext[key];
        return null;
    };

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
    };

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
    };

    // Util functions, to make the above functions a little prettier

    var isEmpty = function(obj) {
        for (var propName in obj)
            if (obj.hasOwnProperty(propName))
                return false;
        return true;
    };

    /**
    * All scalars can be considered strings. Type holds no value in javascript (yet).
    */
    var getScalarWithXPath = function(contextNode, xpath)
    {
        return doc.evaluate(xpath, contextNode, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);
    };

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
        
    };

    var getNodeListWithXPath = function(contextNode, xpath) {
        return doc.evaluate(xpath, contextNode, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);

    };

    var clone = function(obj){
        if(obj == null || typeof(obj) != 'object')
            return obj;

        var temp = obj.constructor(); // changed

        for(var key in obj)
            temp[key] = clone(obj[key]);
        return temp;
    };

    var getMMDField = function(mmd, fieldName) {
    	for(i in mmd.kids) {
    		var mmdField = mmd.kids[i];
    		if (mmdField.scalar != null) {
             	if(mmdField.scalar.name == fieldName)
             		return mmdField.scalar;
            }		
    	}
    };

    var getLabeledNodesFromMetaMetadata = function(response) {
    	//getMmdFromService(function(response) {
    		var metadata = {};
    		//console.log(response);
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

    	    return labeledNodeArr; //metadata;
    	//});
    };