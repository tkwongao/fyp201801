(function($) {

	$.fn.extend({
		heatTable: function(options) {

			var defaults = {
				minColor : [65, 105, 225, 1],			//royal blue
				maxColor : [135, 206, 250, 1]			//light sky blue
			};

			var o = $.extend(defaults, options);

			var hoverBox = $('<div>').addClass('hoverBox');
				hoverBox.append($('<div>').addClass('text-left'));
				hoverBox.append($('<div>').addClass('dropcap text-primary m-t-10'));
			$('body').append(hoverBox);
			
			// do it for every element that matches selector
			this.each(function()
			{
				if(!$(this).hasClass('heatTable'))
				{
					$(this).addClass('heatTable');
				}
				
				var maxValue = null;
				var minValue = null;

				var tableWidth = parseFloat($(this).css('width'));
				
				var self = this;
				
				$(this).find('tbody tr').each(function()
				{
					var numColumn = 0;

					$(this).find('td').each(function()
					{
						var text = $(this).text();

						if($.isNumeric(text))
						{
							var value = parseFloat(text);
					
							if(text > maxValue || maxValue == null)
							{
								maxValue = value;
							}
							
							if(text < minValue || minValue == null)
							{
								minValue = value;
							}
						}
						
						if($(this).attr('colspan'))
						{
							numColumn = numColumn + parseInt($(this).attr('colspan'));
						}
						else
						{
							numColumn = numColumn + 1;
						}
					});
					
					var y_label = $(this).find('td[class="y-label"]');
					if(y_label.length > 0)
					{
						var wrapperElement = $('<span>').html(y_label.text());
						y_label.empty().append(wrapperElement);
						
						var textWidth = parseFloat(wrapperElement.css('width')) + parseFloat(y_label.css('padding-left')) + parseFloat(y_label.css('padding-right'));
						var percent = (textWidth / tableWidth) * 100;
						
						$(this).find('td:not(:last-child)').css('width', ((100 - percent) / numColumn).toString() + '%');
						$(this).find('td:last-child').css('width', percent.toString() + '%');
					}
				});
						
				$(this).find('tbody tr').each(function()
				{
					$(this).find('td:not(".y-label")').each(function(index)
					{
						var text = $(this).text();
						
						if($.isNumeric(text))
						{	
							var value = parseFloat(text);
							
							var intensity = (value - minValue) / (maxValue - minValue);
							
							var finalColor = [
								Math.floor(o.minColor[0] * intensity + o.maxColor[0] * (1 - intensity)),
								Math.floor(o.minColor[1] * intensity + o.maxColor[1] * (1 - intensity)),
								Math.floor(o.minColor[2] * intensity + o.maxColor[2] * (1 - intensity)),
								Math.floor(o.minColor[3] * intensity + o.maxColor[3] * (1 - intensity))
							];

							
							var x_label = $(self).find('tfoot tr:first-child td:nth-child(' + (index + 1) + ')').text();
							var y_label = $(this).parent().find('td.y-label').text();
					
							var element = $('<div>').addClass('paintBox');
							element.css('background-color', 'rgba(' + finalColor.join(', ') + ')');
									
							element.mouseenter(function()
							{
								element.css('background-color', 'rgba(' + o.hoverColor.join(', ') + ')');
							}).mousemove(function(event)
							{		
								hoverBox.find('div:first-child').html(x_label + ' ' + y_label);
								hoverBox.find('div:last-child').html(value);
							
								var left = event.pageX - hoverBox.width() - 40;
								var top = event.pageY - hoverBox.height() / 2.0;
								
								hoverBox.css({
									left: left.toString() + 'px',
									top: top.toString() + 'px'
								}).show();
							}).mouseout(function(event)
							{
								element.css('background-color', 'rgba(' + finalColor.join(', ') + ')');
								hoverBox.hide();
							});
							
							if(o.paintHeight)
							{
								element.css('height', o.paintHeight);
							}
							
							
							$(this).empty();
							$(this).append(element);
						}
					});
				});

			});

			// maintain chainability
			return this;
		}
  });

  $.fn.extend({
    heatTable: $.fn.heatTable
  });

})(jQuery);
