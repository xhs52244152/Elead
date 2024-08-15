/**
 * Word wrapping
 * 
 * @author (Javascript) Dmitry Farafonov
 */

		var AttributedStringIterator = function(text){
				//this.text = this.rtrim(this.ltrim(text));
				text = text.replace(/(\s)+/, " ");
				this.text = this.rtrim(text);
				/*
				if (beginIndex < 0 || beginIndex > endIndex || endIndex > length()) {
					throw new IllegalArgumentException("Invalid substring range");
				}
				*/
				this.beginIndex = 0;
				this.endIndex = this.text.length;
				this.currentIndex = this.beginIndex;
				
				//
				var i = 0;
				var string = this.text;
				var fullPos = 0;
				
				this.startWordOffsets = [];
				this.startWordOffsets.push(fullPos);
				
				// TODO: remove i 1000
				while (i<1000) {
					var pos = string.search(/[ \t\n\f-\.\,]/);
					if (pos == -1)
						break;
					
					// whitespace start
					fullPos += pos;
					string = string.substr(pos);
					
					// remove whitespaces
					var pos = string.search(/[^ \t\n\f-\.\,]/);
					if (pos == -1)
						break;
						
					// whitespace end
					fullPos += pos;
					string = string.substr(pos);
					
					this.startWordOffsets.push(fullPos);
					
					i++;
				}
				//
			};
			AttributedStringIterator.prototype = {
				getEndIndex: function(pos){
					if (typeof(pos) == "undefined")
						return this.endIndex;
						
					var string = this.text.substr(pos, this.endIndex - pos);
					
					var posEndOfLine = string.search(/[\n]/);
					if (posEndOfLine == -1)
						return this.endIndex;
					else
						return pos + posEndOfLine;
				},
				getBeginIndex: function(){
					return this.beginIndex;
				},
				isWhitespace: function(pos){
					var str = this.text[pos];
					var whitespaceChars = " \t\n\f";
					
					return (whitespaceChars.indexOf(str) != -1);
				},
				isNewLine: function(pos){
					var str = this.text[pos];
					var whitespaceChars = "\n";
					
					return (whitespaceChars.indexOf(str) != -1);
				},
				preceding: function(pos){
					//
					for(var i in this.startWordOffsets) {
						var startWordOffset = this.startWordOffsets[i];
						if (pos < startWordOffset && i>0) {
							//
							return this.startWordOffsets[i-1];
						}
					}
					//
					return this.startWordOffsets[i];
				},
				following: function(pos){
					//
					for(var i in this.startWordOffsets) {
						var startWordOffset = this.startWordOffsets[i];
						if (pos < startWordOffset && i>0) {
							//
							return this.startWordOffsets[i];
						}
					}
					//
					return this.startWordOffsets[i];
				},
				ltrim: function(str){
					var patt2=/^\s+/g;
					return str.replace(patt2, "");
				}, 
				rtrim: function(str){
					var patt2=/\s+$/g;
					return str.replace(patt2, "");
				},
				getLayout: function(start, limit){
					return this.text.substr(start, limit - start);
				},
				getCharAtPos: function(pos) {
					return this.text[pos];
				}
			};

		var LineBreakMeasurer = function(paper, x, y, text, fontAttrs){
				this.paper = paper;
				this.text = new AttributedStringIterator(text);
				this.fontAttrs = fontAttrs;
				
				if (this.text.getEndIndex() - this.text.getBeginIndex() < 1) {
					throw {message: "Text must contain at least one character.", code: "IllegalArgumentException"};
				}
				
				//this.measurer = new TextMeasurer(paper, this.text, this.fontAttrs);
				this.limit = this.text.getEndIndex();
				this.pos = this.start = this.text.getBeginIndex();
				
				this.rafaelTextObject = this.paper.text(x, y, this.text.text).attr(fontAttrs).attr("text-anchor", "start");
				this.svgTextObject = this.rafaelTextObject[0];
			};
			LineBreakMeasurer.prototype = {
				nextOffset: function(wrappingWidth, offsetLimit, requireNextWord) {
					//
					var nextOffset = this.pos;
					if (this.pos < this.limit) {
						if (offsetLimit <= this.pos) {
							throw {message: "offsetLimit must be after current position", code: "IllegalArgumentException"};
						}
						
						var charAtMaxAdvance = this.getLineBreakIndex(this.pos, wrappingWidth);
						//charAtMaxAdvance --;
						
						if (charAtMaxAdvance == this.limit) {
							nextOffset = this.limit;
						} else if (this.text.isNewLine(charAtMaxAdvance)) {
							nextOffset = charAtMaxAdvance+1;
						} else if (this.text.isWhitespace(charAtMaxAdvance)) {
							// TODO: find next noSpaceChar
							//return nextOffset;
							nextOffset = this.text.following(charAtMaxAdvance);
						} else {
							// Break is in a word;  back up to previous break.
							/*
							var testPos = charAtMaxAdvance + 1;
							if (testPos == this.limit) {
								
							} else {
								nextOffset = this.text.preceding(charAtMaxAdvance);
							}
							*/
							nextOffset = this.text.preceding(charAtMaxAdvance);
							
							if (nextOffset <= this.pos) {
								nextOffset = Math.max(this.pos+1, charAtMaxAdvance);
							}
						}
					}
					if (nextOffset > offsetLimit) {
						nextOffset = offsetLimit;
					}
					//
					return nextOffset;
				},
				nextLayout: function(wrappingWidth) {
					//
					if (this.pos < this.limit) {
						var requireNextWord = false;
						var layoutLimit = this.nextOffset(wrappingWidth, this.limit, requireNextWord);
						if (layoutLimit == this.pos) {
							//
							return null;
						}
						var result = this.text.getLayout(this.pos, layoutLimit);
						
						// remove end of line
						
						//var posEndOfLine = this.text.getEndIndex(this.pos);
						//if (posEndOfLine < result.length)
						//	result = result.substr(0, posEndOfLine);
						
						this.pos = layoutLimit;
						
						//
						return result;
					} else {
						//
						return null;
					}
				},
				getLineBreakIndex: function(pos, wrappingWidth) {
					//
					
					var bb = this.rafaelTextObject.getBBox();
					
					var charNum = -1;
					try {
						var svgPoint = this.svgTextObject.getStartPositionOfChar(pos);
						//var dot = this.paper.ellipse(svgPoint.x, svgPoint.y, 1, 1).attr({"stroke-width": 0, fill: Color.blue});
						svgPoint.x = svgPoint.x + wrappingWidth;
						//svgPoint.y = bb.y;
					
						//var dot = this.paper.ellipse(svgPoint.x, svgPoint.y, 1, 1).attr({"stroke-width": 0, fill: Color.red});
					
						charNum = this.svgTextObject.getCharNumAtPosition(svgPoint);
					} catch (e){
						
						/*
						var testPos = pos + 1;
						if (testPos < this.limit) {
							return testPos
						}
						*/
					}
					if (charNum == -1) {
						//
						return this.text.getEndIndex(pos);
					} else {
						// When case there is new line between pos and charnum then use this new line
						var newLineIndex = this.text.getEndIndex(pos);
						if (newLineIndex < charNum ) {
							
							return newLineIndex;
						}
							
						//var charAtMaxAdvance  = this.text.text.substring(charNum, charNum + 1);
						var charAtMaxAdvance  = this.text.getCharAtPos(charNum);
						return charNum;
					}
				}, 
				getPosition: function() {
					return this.pos;
				}
			};
