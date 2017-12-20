(function($) {

	$.fn.extend({
		
		dragZoomTool: function(options) {

			var defaults = {
				zoomEnabled: true,
				zoomRate: 1.1,
				defaultZoom: true,
				minZoomLevel: 1,
				maxZoomLevel: 15,
				minColor: [65, 105, 225, 1],
				maxColor: [135, 206, 250, 1],
				isPlotDataPoints: false,
				isPlotHeatMap: false,
				isPlotTrajectory: false,
				dataPointRadius: 10,
				dataPressure: 20,
				onLoad: function() {},
				onSelectedPath: function() {}
			};

			var o = $.extend(defaults, options);
			
			var SVG = (function(){

				SVG = function(element)
				{
					this.currentTool = MapTool.DRAG;
					this.currentZoomLevel = 1;
					this.mouseDownCursorPos = {x: -1, y: -1};
					this.lastCursorPos = {x: -1, y: -1};
					
					this.createNodes(element);
					this.autoRatio();
					this.defaultZoom();
					this.createHeatMap();
					this.addEventBinding();
				}
				
				SVG.prototype.createHeatMap = function()
				{
					var self = this;
					
					var canvas = $('<canvas>');
						canvas.attr('width', this.svgWidth);
						canvas.attr('height', this.svgHeight);
					
					this.heatMap = new HeatCanvas(canvas[0]);
					
					this.heatMap.onRenderingStart = function()
					{
						//console.log('Rendering Start');
					}
					
					this.heatMap.onRenderingEnd = function()
					{						
						var image = self.svgHeatMap[0].firstChild;
				
						if(!image)
						{						
							image = document.createElementNS('http://www.w3.org/2000/svg', 'image');
							image.setAttribute('width', self.svgWidth);
							image.setAttribute('height', self.svgHeight);
							image.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
						}

						image.setAttribute('xlink:href', canvas[0].toDataURL());

						self.svgHeatMap.html(image.outerHTML);

						//console.log('Rendering End');
					}
				};
				
				SVG.prototype.autoRatio = function()
				{
					if(this.divWrapper.width() > this.divWrapper.height())
					{
						var resizedWidth = this.divWrapper.width() / this.divWrapper.height() * this.svgHeight;
						this.svgViewBox = [(this.svgWidth - resizedWidth) / 2.0, 0, resizedWidth, this.svgHeight ];
						
						if(this.svgViewBox[0] + this.svgViewBox[2] > this.divWrapper.width())
						{
							var resizedHeight = this.divWrapper.height() / this.divWrapper.width() * this.svgWidth;
							this.svgViewBox = [0, (this.svgHeight - resizedHeight) / 2.0, this.svgWidth, resizedHeight ];
						}
					}
					else
					{
						var resizedHeight = this.divWrapper.height() / this.divWrapper.width() * this.svgWidth;
						this.svgViewBox = [0, (this.svgHeight - resizedHeight) / 2.0, this.svgWidth, resizedHeight ];
						
						if(this.svgViewBox[1] + this.svgViewBox[3] > this.divWrapper.height())
						{
							var resizedWidth = this.divWrapper.width() / this.divWrapper.height() * this.svgHeight;
							this.svgViewBox = [(this.svgWidth - resizedWidth) / 2.0, 0, resizedWidth, this.svgHeight ];
						}
					}
				};
				
				SVG.prototype.defaultZoom = function()
				{
					
					var defaultViewBox = this.svgViewBox.slice(0); //clone array;
					
					if(o.defaultZoom)
					{
						while(
							defaultViewBox[0] < 0 || 
							defaultViewBox[1] < 0 || 
							defaultViewBox[2] > this.svgWidth || 
							defaultViewBox[3] > this.svgHeight
						){
							var multiplier = 1.0 / o.zoomRate;
							
							defaultViewBox[0] = defaultViewBox[0] + (defaultViewBox[2] - defaultViewBox[2] * multiplier) / 2;
							defaultViewBox[1] = defaultViewBox[1] + (defaultViewBox[3] - defaultViewBox[3] * multiplier) / 2;
							defaultViewBox[2] = defaultViewBox[2] * multiplier;
							defaultViewBox[3] = defaultViewBox[3] * multiplier;
							
							this.currentZoomLevel = this.currentZoomLevel + 1;
						}
					}

					this.svgMain[0].setAttribute('viewBox', defaultViewBox.join(' '));
					this.svgMain.css('width', this.divWrapper.width());
					this.svgMain.css('height', this.divWrapper.height());
				};
		
				SVG.prototype.drawAreaSelectRect = function(startPoint, endPoint)
				{
					var svgRect = [-1, -1, -1, -1];
					
					if(startPoint.x < endPoint.x)
					{
						svgRect[0] = startPoint.x;
					}
					else
					{
						svgRect[0] = endPoint.x;
					}
					
					if(startPoint.y < endPoint.y)
					{
						svgRect[1] = startPoint.y;
					}
					else
					{
						svgRect[1] = endPoint.y;
					}
					
					svgRect[2] = Math.abs(startPoint.x - endPoint.x);
					svgRect[3] = Math.abs(startPoint.y - endPoint.y);
					
					var svgElement = $(document.createElementNS( 'http://www.w3.org/2000/svg', 'rect' ));
						svgElement.attr('x', svgRect[0]);
						svgElement.attr('y', svgRect[1]);
						svgElement.attr('width', svgRect[2]);
						svgElement.attr('height', svgRect[3]);
						svgElement.attr('fill', '#3b5998');
						svgElement.attr('fill-opacity', 0.6);

					this.svgInteract.empty().append(svgElement);
				};
		
				SVG.prototype.zoomTo = function(startPoint, endPoint)
				{
					var moveBackViewBox = [-1, -1, -1, -1];
					
					if(startPoint.x < endPoint.x)
					{
						moveBackViewBox[0] = startPoint.x;
					}
					else
					{
						moveBackViewBox[0] = endPoint.x;
					}
					
					if(startPoint.y < endPoint.y)
					{
						moveBackViewBox[1] = startPoint.y;
					}
					else
					{
						moveBackViewBox[1] = endPoint.y;
					}
					
					var width = Math.abs(startPoint.x - endPoint.x);
					var height = Math.abs(startPoint.y - endPoint.y);
					
					moveBackViewBox[2] = width;
					moveBackViewBox[3] = height;

					/*
					if((width / height) != (this.parentContainer.clientWidth / this.parentContainer.clientHeight))
					{
						if(width >= height)
						{
							moveBackViewBox[3] = this.parentContainer.clientHeight / this.parentContainer.clientWidth * width;
							moveBackViewBox[1] = moveBackViewBox[1] - (moveBackViewBox[3] - height) / 2.0;;
						}
						else
						{
							moveBackViewBox[2] = this.parentContainer.clientWidth / this.parentContainer.clientHeight * height;
							moveBackViewBox[0] = moveBackViewBox[0] - Math.abs(moveBackViewBox[2] - width) / 2.0;
						}
					}
					*/
					
					var zoomLevel = Math.max(
						Math.log(this.svgViewBox[2] / moveBackViewBox[2]) / Math.log(o.zoomRate), 
						Math.log(this.svgViewBox[3] / moveBackViewBox[3]) / Math.log(o.zoomRate)
					);
					
					this.currentZoomLevel = Math.ceil(zoomLevel) + 1;
					
					this.svgMain[0].setAttribute('viewBox', moveBackViewBox.join(' '));
				};
			
				SVG.prototype.dragMap = function(cursorX, cursorY)
				{				
					if(this.currentZoomLevel >= 1)
					{							
						var oldSvgPoint = this.svgMain[0].createSVGPoint();
							oldSvgPoint.x = this.lastCursorPos.x;
							oldSvgPoint.y = this.lastCursorPos.y;
					
						var newSvgPoint = this.svgMain[0].createSVGPoint();
							newSvgPoint.x = cursorX;
							newSvgPoint.y = cursorY;
						
						var ctm = this.svgMain[0].getScreenCTM();
						
						oldSvgPoint = oldSvgPoint.matrixTransform(ctm.inverse());
						newSvgPoint = newSvgPoint.matrixTransform(ctm.inverse());

						var deltaX = ( -1 * (newSvgPoint.x - oldSvgPoint.x));
						var deltaY = ( -1 * (newSvgPoint.y - oldSvgPoint.y));
						
						var moveBackViewBox = this.svgMain[0].getAttribute('viewBox').split(' ').map( n => parseFloat(n));
						
						// check if the x of viewbox is adjustable;
						if(
							(moveBackViewBox[0] >= 0 && deltaX < 0 && moveBackViewBox[0] + moveBackViewBox[2] >= this.svgWidth) ||
							(moveBackViewBox[0] <= 0 && deltaX > 0 && moveBackViewBox[0] + moveBackViewBox[2] <= this.svgWidth) ||
							(moveBackViewBox[0] >= 0 && moveBackViewBox[0] + moveBackViewBox[2] <= this.svgWidth)
						){		
						
							// adjust the deltaX value
							if(moveBackViewBox[0] >= 0 && moveBackViewBox[0] + moveBackViewBox[2] <= this.svgWidth)
							{
								if(moveBackViewBox[0] + deltaX >= 0 && moveBackViewBox[0] + deltaX + moveBackViewBox[2] >= this.svgWidth)
								{
									deltaX = this.svgWidth - (moveBackViewBox[0] + moveBackViewBox[2]);
								}
								
								if(moveBackViewBox[0] + deltaX <= 0 && moveBackViewBox[0] + moveBackViewBox[2] <= this.svgWidth)
								{
									deltaX = 0 - moveBackViewBox[0];
								}
							}			
					
							moveBackViewBox[0] = moveBackViewBox[0] + deltaX;
							
						
							// check if the x of viewbox is valid
							if(moveBackViewBox[0] + moveBackViewBox[2] > this.svgViewBox[0] + this.svgViewBox[2])
							{
								moveBackViewBox[0] = this.svgViewBox[0] + this.svgViewBox[2] - moveBackViewBox[2];
							}
							
							moveBackViewBox[0] = Math.max(this.svgViewBox[0], moveBackViewBox[0]);
							moveBackViewBox[0] = Math.min(this.svgViewBox[0] + this.svgViewBox[2], moveBackViewBox[0]);
						}
						
						// check if the y of viewbox is adjustable;
						if(
							(moveBackViewBox[1] >= 0 && deltaY < 0 && moveBackViewBox[1] + moveBackViewBox[3] >= this.svgHeight) ||
							(moveBackViewBox[1] <= 0 && deltaY > 0 && moveBackViewBox[1] + moveBackViewBox[3] <= this.svgHeight) ||
							(moveBackViewBox[1] >= 0 && moveBackViewBox[1] + moveBackViewBox[3] <= this.svgHeight)
						){
							
							// adjust the delta Y value
							if(moveBackViewBox[1] >= 0 && moveBackViewBox[1] + moveBackViewBox[3] <= this.svgHeight)
							{
								if(moveBackViewBox[1] + deltaY >= 0 && moveBackViewBox[1] + deltaY + moveBackViewBox[3] >= this.svgHeight)
								{
									deltaY = this.svgHeight - (moveBackViewBox[1] + moveBackViewBox[3]);
								}
								
								if(moveBackViewBox[1] + deltaY <= 0 && moveBackViewBox[1] + moveBackViewBox[3] <= this.svgHeight)
								{
									deltaY = 0 - moveBackViewBox[1];
								}
							}	
							
							moveBackViewBox[1] = moveBackViewBox[1] + deltaY;
							
							// check if the y of viewbox is valid
							if(moveBackViewBox[1] + moveBackViewBox[3] > this.svgViewBox[1] + this.svgViewBox[3])
							{
								moveBackViewBox[1] = this.svgViewBox[1] + this.svgViewBox[3] - moveBackViewBox[3];
							}	
							
							moveBackViewBox[1] = Math.max(this.svgViewBox[1], moveBackViewBox[1]);
							moveBackViewBox[1] = Math.min(this.svgViewBox[1] + this.svgViewBox[3], moveBackViewBox[1]);
						}
						
		
						//update svg viewbox
						this.svgMain[0].setAttribute('viewBox', moveBackViewBox.join(' '));
						
						//update camera
						//camera.setViewOffset(this.svgWidth, this.svgHeight, moveBackViewBox[0], moveBackViewBox[1], moveBackViewBox[2], moveBackViewBox[3]);			
					}
				};

				SVG.prototype.mapZoom = function(targetZoomLevel, cursorX, cursorY)
				{						
					if(targetZoomLevel != this.currentZoomLevel)
					{				
						var multiplier = 1.0;
						
						if(targetZoomLevel > this.currentZoomLevel)
						{
							targetZoomLevel = Math.min(o.maxZoomLevel, targetZoomLevel);
							
							//zoom in
							multiplier = 1.0 / Math.pow(o.zoomRate, targetZoomLevel - this.currentZoomLevel);
						}
						else 
						{
							targetZoomLevel = Math.max(o.minZoomLevel, targetZoomLevel);
							
							//zoom out
							multiplier = Math.pow(o.zoomRate, this.currentZoomLevel - targetZoomLevel);
						}

						var cursorPointInScreen = this.svgMain[0].createSVGPoint();
							cursorPointInScreen.x = cursorX;
							cursorPointInScreen.y = cursorY;

						var ctm = this.svgMain[0].getScreenCTM();
						
						var cursorPointInSVG = cursorPointInScreen.matrixTransform(ctm.inverse());

						var moveBackViewBox = [];
					
						if(!(
							cursorPointInSVG.x >= 0 			&& 
							cursorPointInSVG.x <= this.svgWidth 		&& 
							cursorPointInSVG.y >= 0 			&& 
							cursorPointInSVG.y <= this.svgHeight)
						){
							moveBackViewBox = this.svgMain[0].getAttribute('viewBox').split(' ').map( n => parseFloat(n));
								
							moveBackViewBox[0] = moveBackViewBox[0] + (moveBackViewBox[2] - moveBackViewBox[2] * multiplier) / 2;
							moveBackViewBox[1] = moveBackViewBox[1] + (moveBackViewBox[3] - moveBackViewBox[3] * multiplier) / 2;
							moveBackViewBox[2] = moveBackViewBox[2] * multiplier;
							moveBackViewBox[3] = moveBackViewBox[3] * multiplier;
						}
						else
						{				
							// update view box
							var scaleViewBox = this.svgMain[0].getAttribute('viewBox').split(' ').map( n => parseFloat(n));

							scaleViewBox[2] = scaleViewBox[2] * multiplier;	
							scaleViewBox[3] = scaleViewBox[3] * multiplier;
							
							this.svgMain[0].setAttribute('viewBox', scaleViewBox.join(' '));
							
							ctm = this.svgMain[0].getScreenCTM();
						
							var moveToSVGPoint = cursorPointInScreen.matrixTransform(ctm.inverse());

							var deltaX = cursorPointInSVG.x - moveToSVGPoint.x;
							var deltaY = cursorPointInSVG.y - moveToSVGPoint.y;
							
							moveBackViewBox = this.svgMain[0].getAttribute('viewBox').split(' ').map( n => parseFloat(n));

							moveBackViewBox[0] = moveBackViewBox[0] + deltaX;
							moveBackViewBox[1] = moveBackViewBox[1] + deltaY;
						}
						
						if(moveBackViewBox[0] + moveBackViewBox[2] > this.svgViewBox[0] + this.svgViewBox[2])
						{
							moveBackViewBox[0] = this.svgViewBox[0] + this.svgViewBox[2] - moveBackViewBox[2];
						}
						
						if(moveBackViewBox[1] + moveBackViewBox[3] > this.svgViewBox[1] + this.svgViewBox[3])
						{
							moveBackViewBox[1] = this.svgViewBox[1] + this.svgViewBox[3] - moveBackViewBox[3];
						}
						
						moveBackViewBox[0] = Math.max(this.svgViewBox[0], 	moveBackViewBox[0]);
						moveBackViewBox[0] = Math.min(this.svgViewBox[0] + this.svgViewBox[2], 	moveBackViewBox[0]);
						moveBackViewBox[1] = Math.max(this.svgViewBox[1], 	moveBackViewBox[1]);
						moveBackViewBox[1] = Math.min(this.svgViewBox[1] + this.svgViewBox[3], 	moveBackViewBox[1]);
						
						moveBackViewBox[2] = Math.max(0, moveBackViewBox[2]);
						moveBackViewBox[2] = Math.min(this.svgViewBox[2], moveBackViewBox[2]);
						moveBackViewBox[3] = Math.max(0, moveBackViewBox[3]);
						moveBackViewBox[3] = Math.min(this.svgViewBox[3], moveBackViewBox[3]);

						this.svgMain[0].setAttribute('viewBox', moveBackViewBox.join(' '));
						
						//update camera
						//camera.setViewOffset(this.svgWidth, this.svgHeight, moveBackViewBox[0], moveBackViewBox[1], moveBackViewBox[2], moveBackViewBox[3]);
					}
				};
				
				SVG.prototype.reset = function()
				{					
					if(this.divWrapper.width() > this.divWrapper.height())
					{
						var resizedWidth = this.divWrapper.width() / this.divWrapper.height() * this.svgHeight;
						this.svgViewBox = [(this.svgWidth - resizedWidth) / 2.0, 0, resizedWidth, this.svgHeight ];
						
						if(this.svgViewBox[0] + this.svgViewBox[2] > this.divWrapper.width())
						{
							var resizedHeight = this.divWrapper.height() / this.divWrapper.width() * this.svgWidth;
							this.svgViewBox = [0, (this.svgHeight - resizedHeight) / 2.0, this.svgWidth, resizedHeight ];
						}
					}
					else
					{
						var resizedHeight = this.divWrapper.height() / this.divWrapper.width() * this.svgWidth;
						this.svgViewBox = [0, (this.svgHeight - resizedHeight) / 2.0, this.svgWidth, resizedHeight ];
						
						if(this.svgViewBox[1] + this.svgViewBox[3] > parentContainer.clientHeight)
						{
							var resizedWidth = this.divWrapper.width() / this.divWrapper.height() * this.svgHeight;
							this.svgViewBox = [(this.svgWidth - resizedWidth) / 2.0, 0, resizedWidth, this.svgHeight ];
						}
					}
					
					this.svgMain[0].setAttribute('viewBox', this.svgViewBox.join(' '));
					
					this.mouseDownCursorPos = {x: -1, y: -1};
					this.lastCursorPos = {x: -1, y: -1};
					
					this.currentZoomLevel = o.minZoomLevel;
				};
				
				SVG.prototype.select = function(name)
				{
					name = $.trim(name);  
					
					var path = this.svgMain.find('g#gShopBoundingBox path[name="' + name + '"]').first();

					if(path.length > 0)
					{			
						var boundingRect = path.get(0).getBoundingClientRect();
						
						var startPos = screenToSvg(this.svgMain[0], {x: boundingRect.left, y: boundingRect.top});
						var endPos = screenToSvg(this.svgMain[0], {x: boundingRect.right, y: boundingRect.bottom});

						this.zoomTo(startPos, endPos);
					}
				};

				SVG.prototype.update = function()
				{					
					if(!o.isPlotTrajectory)
					{
						return;
					}

					this.hitCounts = {};
					this.dataPoints = [];

					var svgMainViewBox = this.svgMain[0].getAttribute('viewBox').split(' ').map( n => parseFloat(n));
				
					var viewBoxRect = this.svgMain[0].createSVGRect();
						viewBoxRect.x = svgMainViewBox[0];
						viewBoxRect.y = svgMainViewBox[1];
						viewBoxRect.width = svgMainViewBox[2];
						viewBoxRect.height = svgMainViewBox[3];

					for(var i = 0; i < 300; i++)
					{
						var intensity = Math.random();
						
						var finalColor = [
							Math.floor(o.minColor[0] * intensity + o.maxColor[0] * (1 - intensity)),
							Math.floor(o.minColor[1] * intensity + o.maxColor[1] * (1 - intensity)),
							Math.floor(o.minColor[2] * intensity + o.maxColor[2] * (1 - intensity)),
							Math.floor(o.minColor[3] * intensity + o.maxColor[3] * (1 - intensity))
						];
						
						var svgPoint = this.svgObject[0].createSVGPoint();	
						var dataPointRect = this.svgObject[0].createSVGRect();
						
						var hasIntersection = false;
						
						do {
							hasIntersection = false;
						
							svgPoint.x 	= Math.floor(Math.random() * this.svgWidth);
							svgPoint.y  = Math.floor(Math.random() * this.svgHeight);
			
							dataPointRect.x = svgPoint.x - o.dataPointRadius;
							dataPointRect.y = svgPoint.y - o.dataPointRadius;
							dataPointRect.width = o.dataPointRadius * 2;
							dataPointRect.height = o.dataPointRadius * 2;

							var svgElements = this.svgObject[0].getElementById('gShopBoundingBox').childNodes;
				
							for(var j = 1; j < svgElements.length; j+=2)
							{
								if(this.svgObject[0].checkIntersection(svgElements[j], dataPointRect))
								{
									hasIntersection = true;
									break;
								}
							}
						} while (hasIntersection);

						this.dataPoints.push({x: svgPoint.x, y: svgPoint.y, radius: o.dataPointRadius, finalColor: finalColor});
						
						if(!this.hitCounts[svgPoint.y])
						{
							this.hitCounts[svgPoint.y] = { };
							this.hitCounts[svgPoint.y][svgPoint.x] = Math.random();
						}
						else
						{
							if(!this.hitCounts[svgPoint.y][svgPoint.x])
							{
								this.hitCounts[svgPoint.y][svgPoint.x] = Math.random();
							}
							else
							{
								this.hitCounts[svgPoint.y][svgPoint.x] = this.hitCounts[svgPoint.y][svgPoint.x] + Math.random();
							}
						}
					}
					
					if(o.isPlotDataPoints)
					{
						this.plotDataPoints();
						
						o.isPlotDataPoints = false;
					}
					else
					{
						this.svgPlot.empty();
					}
					
					if(o.isPlotHeatMap)
					{
						this.plotHeatMap();
					}
					else
					{
						this.svgHeatMap.empty();
					}
					
					if(o.isPlotTrajectory)
					{
						this.plotTrajectory();
						
						o.isPlotTrajectory = false;
					}
				};
				
				SVG.prototype.loadDataPoints = function()
				{
					
				};
				
				SVG.prototype.plotTrajectory = function()
				{					
					var hitCounts = this.hitCounts;
					
					var getMaxAdjacentPoint = function(paths, centerPoint, maskSize)
					{						
						var maxPoint = null;
						
						do {
							var x_range = {left: centerPoint.x - ((maskSize - 1) / 2), right: centerPoint.x + ((maskSize - 1) / 2)};
							var y_range = {top: centerPoint.y - ((maskSize - 1) / 2), bottom: centerPoint.y + ((maskSize - 1) / 2)};
							
							for(var y = y_range.top; y <= y_range.bottom; y++)
							{
								for(var x = x_range.left; x <= x_range.right; x++)
								{										
									if(hitCounts[y] && hitCounts[y][x])
									{										
										if(maxPoint == null || hitCounts[y][x] > hitCounts[maxPoint.y][maxPoint.x])
										{
											var hit = false;
											
											for(var i in paths)
											{
												if(paths[i].x == x && paths[i].y == y)
												{
													hit = true;
												}
											}
											
											if(!hit)
											{
												maxPoint = { x: x, y: y};
											}
										}
									}
								}
							}
							
							maskSize = maskSize + 2;
							
						} while(maxPoint == null && maskSize < 400);
						
						return maxPoint;
					}
					
					var getPath = function(startPoint)
					{
						var paths = [startPoint];
						var newCenterPoint = null;
						var centerPoint = startPoint;
						
						do {
							newCenterPoint = getMaxAdjacentPoint(paths, centerPoint, 3);

							if(newCenterPoint != null)
							{
								paths.push(newCenterPoint);
							}
							
							centerPoint = newCenterPoint;
							
						} while(newCenterPoint != null)
							
						return paths;				
					}
					
					var paths = getPath({x: 0, y:0});
					var html = '';

					for(var i = 0; i < paths.length; i++)
					{
						if( i + 1 < paths.length)
						{
							var point_s = paths[i];
							var point_e = paths[i+1];

							var svgElement = $(document.createElementNS( 'http://www.w3.org/2000/svg', 'path' ));
								svgElement.attr('d', 'M' + point_s.x + ' ' + point_s.y + ' L' + point_e.x + ' ' + point_e.y + ' Z');
								svgElement.attr('stroke', 'black');
								svgElement.attr('stroke-width', 5);
								svgElement.attr('fill', 'none');
								
							html = html + svgElement[0].outerHTML;			
						}						
					}

					this.svgTrajectory.html(html);
					this.animateTrajectory();
				};
				
				SVG.prototype.animateTrajectory = function()
				{					
					var locked = false;
					
					var then = Date.now();

					// custom fps, otherwise fallback to 60
					var fps = 1.0;
					
					var paths = this.svgTrajectory.find('path');
			 
					var animate = function() {
						requestAnimationFrame(animate);

						if(!locked)
						{
							locked = true;
							
							var now = Date.now();
		
							var delta = (now - then) / 1000.0;

							if (delta >= (1.0 / fps)) {
								// Update time
								// now - (delta % interval) is an improvement over just 
								// using then = now, which can end up lowering overall fps
								
								then = now - (delta % (1.0 / fps));
							
								if(typeof this.animateTrajectoryCounter == 'undefined')
								{
									this.animateTrajectoryCounter = 0;
								}
								else
								{
									this.animateTrajectoryCounter = (this.animateTrajectoryCounter + 1) % 15;
								}
							
								paths.attr('stroke', 'black');
								
								for(var i = 0; i < paths.length; i++)
								{
									if((i + 15) % (this.animateTrajectoryCounter + 15) == 0)
									{
										paths.eq(i).attr('stroke', 'red');
									}
									else
									{
										paths.eq(i).attr('stroke', 'black');
									}
								}
							}
							
							locked = false;
						}
					};
					
					animate();
				};
				
				SVG.prototype.plotDataPoints = function()
				{
					if(this.dataPoints.length > 0)
					{
						var svgMainViewBox = this.svgMain[0].getAttribute('viewBox').split(' ').map( n => parseFloat(n));
						
						var viewBoxRect = this.svgMain[0].createSVGRect();
							viewBoxRect.x = svgMainViewBox[0];
							viewBoxRect.y = svgMainViewBox[1];
							viewBoxRect.width = svgMainViewBox[2];
							viewBoxRect.height = svgMainViewBox[3];

						var dataPointRect = this.svgMain[0].createSVGRect();
							
						var html = '';
	
						for(var i in this.dataPoints)
						{		
							dataPointRect.x = this.dataPoints[i].x;
							dataPointRect.y = this.dataPoints[i].y;
							dataPointRect.width = 0;
							dataPointRect.height = 0;
							
							if(intersectSVGRect(viewBoxRect, dataPointRect))
							{			
								var svgElement = document.createElementNS( 'http://www.w3.org/2000/svg', 'circle' );
									svgElement.setAttribute('cx', this.dataPoints[i].x);
									svgElement.setAttribute('cy', this.dataPoints[i].y);
									svgElement.setAttribute('r', this.dataPoints[i].radius);
									svgElement.setAttribute('fill', 'rgba(' + this.dataPoints[i].finalColor.join(', ') + ')');
									
								html = html + svgElement.outerHTML;
							}
						}

						this.svgPlot[0].innerHTML = html;
					}
				};
				
				SVG.prototype.plotHeatMap = function()
				{
					this.heatMap.clear();

					var svgMainViewBox = this.svgMain[0].getAttribute('viewBox').split(' ').map( n => parseFloat(n));
						
					var viewBoxRect = this.svgMain[0].createSVGRect();
						viewBoxRect.x = svgMainViewBox[0];
						viewBoxRect.y = svgMainViewBox[1];
						viewBoxRect.width = svgMainViewBox[2];
						viewBoxRect.height = svgMainViewBox[3];
						
					var dataPointRect = this.svgMain[0].createSVGRect();
					
					for (var i = 0; i < this.dataPoints.length; i++)
					{		
						dataPointRect.x = this.dataPoints[i].x;
						dataPointRect.y = this.dataPoints[i].y;
						dataPointRect.width = 0;
						dataPointRect.height = 0;
						
						if(intersectSVGRect(viewBoxRect, dataPointRect))
						{
							this.heatMap.push(this.dataPoints[i].x, this.dataPoints[i].y, o.dataPressure);
						}
					}
					
					this.heatMap.render(1, null, null);
				};
				
				var hoverBox = $('<div>').addClass('hoverBox');
				
				SVG.prototype.addEventBinding = function()
				{					
					var self = this;
					
					$('body').append(hoverBox);
					
					this.svgObject.find('g#gShopBoundingBox path').css('fill-opacity', 0.5).bind('mousemove', function(event)
					{
						var boundingRect = $(this).get(0).getBoundingClientRect();
						
						$(this).css('fill', '#777777');
						
						var innerHTML = $(this).attr('name');
						
						hoverBox.html(innerHTML);
						
						hoverBox.css({
							left: (event.pageX - hoverBox.width() - 40).toString() + 'px',
							top: (event.pageY - hoverBox.height() / 2.0).toString() + 'px'
						});
						
						hoverBox.show();
						
					}).bind('mouseout', function(event)
					{
						$(this).css('fill', 'none');
						hoverBox.hide();
					}).bind('dblclick', function(event)
					{
						var path = $(this).get(0);
						var boundingRect = path.getBoundingClientRect();
						
						var startPos = screenToSvg(self.svgMain[0], {x: boundingRect.left, y: boundingRect.top});
						var endPos = screenToSvg(self.svgMain[0], {x: boundingRect.right, y: boundingRect.bottom});

						o.onSelectedPath(path);
						
						self.zoomTo(startPos, endPos);
						
						event.stopPropagation();
					});
					
					this.divWrapper.find('div.floor-plan-buttons button').bind('mouseup', function(event)
					{
						var button = $(this);
						if(button.hasClass('dragTool'))
						{
							self.currentTool = MapTool.DRAG;
						}
						else if(button.hasClass('areaSelectTool'))
						{
							self.currentTool = MapTool.AREA_SELECT;
						}
						else if(button.hasClass('mapReset'))
						{
							self.reset();
						}
						
						event.stopPropagation();
					});
					
					$(window).bind('resize', function(event)
					{			
						var beforeWidth = self.svgMain.width();
						var beforeHeight = self.svgMain.height();

						var newWidth = self.divWrapper.width();
						var newHeight = self.divWrapper.height();
						
						var moveBackViewBox = self.svgMain[0].getAttribute('viewBox').split(' ').map( n => parseFloat(n) )
						
						var multiplier = newWidth / beforeWidth;
						
						if(newWidth != beforeWidth)
						{
							var multiplier = newWidth / beforeWidth;
							
							moveBackViewBox[0] = moveBackViewBox[0] + (moveBackViewBox[2] - moveBackViewBox[2] * multiplier) / 2;
							moveBackViewBox[2] = moveBackViewBox[2] * multiplier;
						}
						
						if(newHeight != beforeHeight)
						{
							var multiplier = newHeight / beforeHeight;
								
							moveBackViewBox[1] = moveBackViewBox[1] + (moveBackViewBox[3] - moveBackViewBox[3] * multiplier) / 2;
							moveBackViewBox[3] = moveBackViewBox[3] * multiplier;
						}

						self.svgMain[0].setAttribute('viewBox', moveBackViewBox.join(' '));
						
						self.svgMain.css('width', newWidth);
						self.svgMain.css('height', newHeight);
					});

					this.svgContainer.bind('mousewheel DOMMouseScroll', function(event)
					{
						//allow zoom but not scroll
						if (!event.ctrlKey) {
				
							var targetZoomLevel;

							if(event.originalEvent.wheelDelta > 0 || event.originalEvent.detail > 0)
							{
								targetZoomLevel = self.currentZoomLevel + 1;
							}
							else
							{
								targetZoomLevel = self.currentZoomLevel - 1;
							}

							if(
								(self.currentZoomLevel > o.maxZoomLevel && targetZoomLevel < self.currentZoomLevel) ||
								(self.currentZoomLevel < o.minZoomLevel && targetZoomLevel > self.currentZoomLevel) || 
								(targetZoomLevel >= o.minZoomLevel && targetZoomLevel <= o.maxZoomLevel)
							){								
								self.mapZoom(targetZoomLevel, event.clientX, event.clientY)
								self.currentZoomLevel = targetZoomLevel;
							}

							event.preventDefault();
						}
					});
					
					this.svgContainer.bind('mousedown', function(event)
					{
						self.lastCursorPos = {x: event.clientX, y: event.clientY };
						self.mouseDownCursorPos = {x: event.clientX, y: event.clientY };

						$('body').css('cursor', 'move');
						
						self.svgContainer.bind('mousemove', function(event)
						{	
							switch(self.currentTool)
							{
								case MapTool.DRAG:
								{								
									if(self.currentZoomLevel >= 1)
									{
										if(self.lastCursorPos.x != -1 && self.lastCursorPos.y != -1)
										{								
											self.dragMap(event.clientX, event.clientY);
										}
									}
								}
									break;
									
								case MapTool.AREA_SELECT:
								{
									var startPoint = screenToSvg(self.svgMain[0], self.mouseDownCursorPos);
									var endPoint =  screenToSvg(self.svgMain[0], {x: event.clientX, y: event.clientY});
									
									self.drawAreaSelectRect(startPoint, endPoint);
								}	
									break;
							}
							
							self.lastCursorPos = {x: event.clientX, y: event.clientY };
						});
						
						event.preventDefault();
					});
					
					
					this.svgContainer.bind('mouseup', function(event)
					{
						$('body').css('cursor', 'default');
						
						self.svgContainer.unbind('mousemove');	

						switch(self.currentTool)
						{
							case MapTool.DRAG:
							{
			
							}
								break;
							case MapTool.AREA_SELECT:
							{																		
								self.svgInteract.empty();
			
								if(self.mouseDownCursorPos.x != event.clientX && self.mouseDownCursorPos.y != event.clientY)
								{
									var mouseDownCursorPos = screenToSvg(self.svgMain[0], self.mouseDownCursorPos);
									var mouseUpCursorPos = screenToSvg(self.svgMain[0], {x: event.clientX, y:event.clientY});
									
									
									if(
										(	mouseDownCursorPos.x > 0 && mouseDownCursorPos.x <= self.svgWidth && 
											mouseDownCursorPos.y > 0 && mouseDownCursorPos.y <= self.svgHeight		) ||
										(	mouseUpCursorPos.x > 0 && mouseUpCursorPos.x <= self.svgWidth && 
											mouseUpCursorPos.y > 0 && mouseUpCursorPos.y <= self.svgHeight		)
									){
										self.zoomTo(mouseDownCursorPos, mouseUpCursorPos);
									}
								}
								
																	
								self.currentTool = MapTool.DRAG;
							}
								break;
						}
					});
					
					/*
					// useful for checking coordinate in world space
					$(self.domElement).bind('mouseup', function(event)
					{		
						var this.svgMain = self.domElement.firstChild;
					
						var screenPoint = this.svgMain.createSVGPoint();
							screenPoint.x = event.clientX;
							screenPoint.y = event.clientY;
							
						var svgPoint = screenToSvg(this.svgMain, screenPoint);

						var worldPos = svgToWorld(this.svgMain, svgPoint, camera);

						console.log(worldPos);
					});
					*/
					
					this.svgContainer.bind('dblclick', function(event)
					{	
						for(var i = 1; i <= 4; i++)
						{
							setTimeout(function()
							{
								if(self.currentZoomLevel < o.maxZoomLevel)
								{
									self.mapZoom(self.currentZoomLevel + 1, event.clientX, event.clientY);
									self.currentZoomLevel = self.currentZoomLevel + 1;
								}
							}, i * 20, event, self, i);
						}
					});
				};
			
				SVG.prototype.createNodes = function(element)
				{
					this.svgObject = $(element.contentDocument.documentElement);
					
					this.divWrapper = $('<div>');
					this.divWrapper.addClass('floor-plan-markers').attr('name', $(element).attr('name'));
					this.divWrapper.css('height', $(element).height());
		
					var buttons = $('<div>');
						buttons.addClass('floor-plan-buttons');
						buttons.addClass('btn-group-vertical');
						
					var dragButton = $('<button>');
						dragButton.attr('role', 'button');
						dragButton.addClass('dragTool');
						dragButton.addClass('btn');
						dragButton.addClass('btn-icon');
						dragButton.addClass('btn-purple');
						dragButton.addClass('waves-effect');
						dragButton.addClass('waves-light');
						dragButton.append(
							$('<i>').addClass('fa')
									.addClass('fa-arrows')
						);

					var areaSelectButton = $('<button>');
						areaSelectButton.attr('role', 'button');
						areaSelectButton.addClass('areaSelectTool');
						areaSelectButton.addClass('btn');
						areaSelectButton.addClass('btn-icon');
						areaSelectButton.addClass('btn-primary');
						areaSelectButton.addClass('waves-effect');
						areaSelectButton.addClass('waves-light');
						areaSelectButton.append(
							$('<i>').addClass('fa')
									.addClass('fa-square-o')
						);
						
					var mapResetButton = $('<button>');
						mapResetButton.attr('role', 'button');
						mapResetButton.addClass('mapReset');
						mapResetButton.addClass('btn');
						mapResetButton.addClass('btn-icon');
						mapResetButton.addClass('btn-success');
						mapResetButton.addClass('waves-effect');
						mapResetButton.addClass('waves-light');
						mapResetButton.append(
							$('<i>').addClass('fa')
									.addClass('fa-retweet')
						);

					buttons.append(dragButton);
					buttons.append(areaSelectButton);
					buttons.append(mapResetButton);
					
					this.svgWidth = parseFloat(this.svgObject.attr('width'));
					this.svgHeight = parseFloat(this.svgObject.attr('height'));
					this.svgViewBox = [0, 0, this.svgWidth, this.svgHeight];
					
					this.svgMain = $(document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ));
					this.svgMain.addClass('svgMain');
					this.svgMain.attr('width', this.svgWidth);
					this.svgMain.attr('height', this.svgHeight);

					this.svgPlot = $(document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ));
					this.svgPlot.addClass('plotLayer');
					this.svgPlot.attr('width', this.svgWidth);
					this.svgPlot.attr('height', this.svgHeight);
					this.svgPlot[0].setAttribute('viewBox', this.svgObject[0].getAttribute('viewBox'));
						
					this.svgHeatMap = $(document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ));
					this.svgHeatMap.addClass('heatMapLayer');
					this.svgHeatMap.attr('width', this.svgWidth);
					this.svgHeatMap.attr('height', this.svgHeight);
					this.svgHeatMap[0].setAttribute('viewBox', this.svgObject[0].getAttribute('viewBox'));
						
					this.svgInteract = $(document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ));
					this.svgInteract.addClass('interactiveLayer');
					this.svgInteract.attr('width', this.svgWidth);
					this.svgInteract.attr('height', this.svgHeight);
					this.svgInteract[0].setAttribute('viewBox', this.svgObject[0].getAttribute('viewBox'));
					
					this.svgTrajectory = $(document.createElementNS( 'http://www.w3.org/2000/svg', 'svg' ));
					this.svgTrajectory.addClass('trajectoryLayer');
					this.svgTrajectory.attr('width', this.svgWidth);
					this.svgTrajectory.attr('height', this.svgHeight);
					this.svgTrajectory[0].setAttribute('viewBox', this.svgObject[0].getAttribute('viewBox'));
					
					this.svgMain.append(this.svgObject);
					this.svgMain.append(this.svgPlot);
					this.svgMain.append(this.svgHeatMap);
					this.svgMain.append(this.svgInteract);
					this.svgMain.append(this.svgTrajectory);
					
					this.svgContainer = $('<div>');
					this.svgContainer.addClass('svgContainer');
					this.svgContainer.append(this.svgMain);
					
					this.divWrapper.append(this.svgContainer);
					this.divWrapper.append(buttons);
			
					$(element).replaceWith(this.divWrapper);
				}
				
				return SVG;
				
			})();

			var instances = {};
			
			// do it for every element that matches selector
			this.each(function(index)
			{	
				var self = this;
			
				var element = $(this).get(0);
				
				element.addEventListener('load', function() {
					var svg = new SVG(element);
					instances[index] = svg;
					
					self.select = function(name) {
						return svg.select(name);
					};
					
					self.update = function() {
						svg.update();
					};
				});
			});
			
			this.update = function()
			{
				for(var i in instances)
				{
					instances[i].update();
				}
			};

			// maintain chainability
			return this;

		}
  });

  $.fn.extend({
    dragZoomTool: $.fn.dragZoomTool
  });

})(jQuery);
