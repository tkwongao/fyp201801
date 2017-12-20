(function($) {

	$.fn.extend({
		autoComplete: function(options) {

			var defaults = {
				autoExpand: true,
				onSelectItem: function() { }
			};

			var o = $.extend(defaults, options);
			
			var createCache = function(data, newData, parentID)
			{
				for(var i in data)
				{		
					newData[i] = {};
			
					for(var j in data[i])
					{
						if(j != 'sub')
						{
							newData[i][j] = data[i][j];
						}
						else
						{						
							createCache(data[i][j], newData, i);							
						}
					}

					if(parentID)
					{
						newData[i]['parentID'] = parentID;
					}
				}
			};
			
			var constructElement = function(data, layer, parentID)
			{		
				var ulHasChild = false;
		
				var ul = $('<ul>');
					ul.attr('layer', layer);
					ul.attr('autoExpand', o.autoExpand ? 'true' : 'false');
				
				for(var i in data)
				{					
					var li = $('<li>');
					var a = $('<a>');
						a.attr('href', 'javascript:void(0);');
						a.attr('id', i);
						a.css('padding-left', (10 * (layer + 0.5)).toString() + 'px');
						a.html(data[i]['name']);
						
					if(parentID)
					{
						a.attr('parentID', parentID);
					}
			
					for(var j in data[i])
					{
						if(j != 'sub')
						{
							a.attr(j, data[i][j]);
						}
						else
						{	
							var span = $('<span>').addClass('menu-arrow-collapse').addClass('pull-right');
							a.append(span);
					
							var ele = constructElement(data[i][j], layer + 1, i);
							li.append(ele);
							
						}
					}	
					
					li.prepend(a);
					ul.append(li);
					
					ulHasChild = true;
				}
				
				return ulHasChild ? ul : null;
			};
			
			/*
			var constructElement = function(data, layer)
			{						
				if(typeof data != 'object')
				{
					var li = $('<li>');
					var a = $('<a>');
						a.attr('href', 'javascript:void(0);');
						a.attr('name', data);
						a.html(data)
						
					li.append(a);
					
					return li;
				}
				else
				{	
					var ulHasChild = false;
			
					var ul = $('<ul>');
						ul.attr('layer', layer);
						ul.attr('autoExpand', o.autoExpand ? 'true' : 'false');
					
					for(var i in data)
					{
						if(Array.isArray(data))
						{
							var ele = constructElement(data[i], layer+1);
							ele.find('a').css('padding-left', (10 * (layer + 0.5)).toString() + 'px');
							ul.addClass('lastLayer');
							ul.append(ele);
						}
						else
						{
							var ele1 = constructElement(i);
							var ele2 = constructElement(data[i], layer+1);
	
							ele1.find('a').css('padding-left', (10 * (layer + 0.5)).toString() + 'px');
	
							if(ele2 != null)
							{
								ele2.attr('layer', layer+1);
								
								var span = $('<span>').addClass('menu-arrow-collapse').addClass('pull-right');
								
								ele1.find('a').append(span);
								ele1.append(ele2);
							}
							
							ul.append(ele1);
						}
						
						ulHasChild = true;
					}
					
					return ulHasChild ? ul : null;
				}
			};
			*/
			
			// do it for every element that matches selector
			this.each(function()
			{			
				this.cache = {};
				createCache(o.data, this.cache, null);
			
				var parent = $(this).parent();
				
				var typebox = $('<div>').addClass('auto-complete-typebox');
				
				var input = $(this).clone();
					
				var searchClearSpan = $('<span>').addClass('fa').addClass('fa-remove').addClass('searchClear');
					searchClearSpan.hide();
				var locationSpan = $('<span>').addClass('fa').addClass('fa-map-marker').addClass('mapMarker');
				var searchWrapper = $('<div>').addClass('form-group');
					searchWrapper.append(input);
					searchWrapper.append(locationSpan);
					searchWrapper.append(searchClearSpan);
					
				typebox.append(searchWrapper);
				
				var result = $('<div>').addClass('auto-complete-result');
			
				result.append(constructElement(o.data, 1));
				
				typebox.append(result);
				
				$(this).replaceWith(typebox);
				
				var chosenElement = null;
				
				searchClearSpan.on('click', function(){ 
					input.val(''); 
					result.find('li').removeClass('matched').show();
					result.find('ul li ul').hide();
					result.find('span').addClass('menu-arrow-collapse').removeClass('menu-arrow-expand');
					$(this).hide();
				});
				input.on('focus', function() {
					result.show();
					result.find('ul').attr('autoExpand', o.autoExpand ? 'true' : 'false');
					
					if($(this).val().length == 0)
					{
						result.find('li').removeClass('matched').show();
						result.find('ul li ul').hide();
						result.find('span').addClass('menu-arrow-collapse').removeClass('menu-arrow-expand');
					}

				}).on('blur', function() {
					result.hide();
				}).on('input', function() {
					result.find('span').addClass('menu-arrow-collapse').removeClass('menu-arrow-expand');
					result.find('li').removeClass('matched').removeClass('unmatched').show();
					result.find('ul li ul').hide();
					result.find('ul li a').each(function()
					{
						var text = $.trim($(this).attr('name'));
						
						var contents = $(this).contents();
						
						contents.each(function(index)
						{
							if(index == 0)
							{	
								$(this).replaceWith(text);
							}
							else
							{
								if($(this).prop('tagName') != 'SPAN')
								{
									$(this).remove();
								}
							}
						});
					});
					
					var inputStr = $.trim($(this).val().toLowerCase());
						
					if(inputStr.length == 0)
					{
						searchClearSpan.hide();
						
						return;
					}
					else
					{
						searchClearSpan.show();
					}
					
					result.find('ul li a').each(function() {	
						
						var matchingStr = $.trim($(this).attr('name'));
						
						var text = matchingStr;
							
						var regex = new RegExp('(.*?)(' + inputStr + ')(.*?)', 'gi');
						
						if(regex.test(matchingStr))
						{				
							var li = $(this).parent();
								li.addClass('matched');
									
							var ul = li.parent();
							var layer = parseInt(ul.attr('layer'));

							for(var i = layer; i >= 1; i--)
							{
								li.show();
								ul.show();
								
								if(i != layer)
								{
									var span = li.children('a').children('span');
									span.removeClass('menu-arrow-collapse').addClass('menu-arrow-expand');
								}
								
								li = li.parent().parent();
								ul = li.parent();
							}
							
							text = matchingStr.replace(regex, "$1" + '<b>' + "$2" + '</b>' + "$3");
							
							$(this).contents().first().replaceWith(text);
						}
						else
						{
							var li = $(this).parent();
								li.removeClass('matched');
								li.hide();
						}
					});
				});
				
				result.find('ul li').hover(function() {
					var childUL = $(this).children('ul');
					var childLI = childUL.children('li');
					var span = $(this).children('a').children('span');

					if(childUL.attr('autoExpand') == 'true' && childUL.children('li.matched').length == 0)
					{
						childUL.show();
						childLI.show();
						span.addClass('menu-arrow-expand').removeClass('menu-arrow-collapse');
					}
										
				}, function() {});
				result.find('ul li a').on('mousedown', function(event) {
					event.preventDefault();
				}).on('click', function(event) {
					
					searchClearSpan.show();
					
					var a = $(this);
					var li = a.parent();
					var ul = li.parent();
					var layer = parseInt(ul.attr('layer'));
					
					if(chosenElement != null)
					{
						chosenElement.removeClass('chosen');
					}
					
					li.addClass('chosen');
					chosenElement = li;
					
					//clear the bold text
					var text = $.trim(a.attr('name'));
					
					var contents = $(this).contents();
					
					contents.each(function(index)
					{
						if(index == 0)
						{	
							$(this).replaceWith(text);
						}
						else
						{
							if($(this).prop('tagName') != 'SPAN')
							{
								$(this).remove();
							}
						}
					});
					
					//concat the string from layers
					var str = [];
					
					for(var i = layer; i >= 1; i--)
					{
						var li = a.parent();
						var ul = li.parent();
						var span = a.children('span');
						li.show();
						ul.show();
						
						if(span.length > 0)
						{
							span.removeClass('menu-arrow-collapse').addClass('menu-arrow-expand');
						}
						
						str[i-1] = $.trim(a.attr('name'));

						a = ul.parent().children('a');
						
					}
					
					input.val(str.join(', '));
					
					o.onSelectItem(chosenElement[0]);
					
					input.blur();
				});
				
				result.find('span').on('click', function(event)
				{
					var childUL = $(this).closest('li').children('ul');
					var childLI = childUL.children('li');
					// var childChildUL = childUL.find('li ul');
					
					childUL.attr('autoExpand', 'false');
					// childChildUL.attr('autoExpand', 'true');
				
					if($(this).hasClass('menu-arrow-expand'))
					{
						if(childUL.children('li:visible').length == childUL.children('li').length)
						{
							$(this).removeClass('menu-arrow-expand').addClass('menu-arrow-collapse');

							childUL.hide();
							childLI.hide();
						}
						else
						{
							childUL.show();
							childLI.show();
						}						
					}
					else if($(this).hasClass('menu-arrow-collapse'))
					{
						$(this).removeClass('menu-arrow-collapse').addClass('menu-arrow-expand');
						
						childUL.show();
						childLI.show();
					}

					event.stopPropagation();
				});
				
			});

			// maintain chainability
			return this;
		}
  });

  $.fn.extend({
    autoComplete: $.fn.autoComplete
  });

})(jQuery);
