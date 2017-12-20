(function($) {

	$.fn.extend({
		retentionTable: function(options) {

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
				if(!$(this).hasClass('retentionTable'))
				{
					$(this).addClass('retentionTable');
				}
				
				var tableWidth = parseFloat($(this).css('width'));
				
				var numColumn = $(this).find('tbody tr:first td:not([class=y-label])').length;
				
				var self = this;
				
				$(this).find('tbody tr').each(function()
				{
					var percent;
					var maxText = $(this).find('td:nth-child(2)').text();
					var maxValue = $.isNumeric(maxText) ? parseFloat(maxText) : -1;
					
					$(this).find('td').each(function(index)
					{
						var finalWidth;
						
						if(index == 0 && $(this).hasClass('y-label'))
						{
							var wrapperElement = $('<span>').html($(this).text());
							$(this).empty().append(wrapperElement);
							
							var textWidth = parseFloat(wrapperElement.css('width')) + parseFloat($(this).css('padding-left')) + parseFloat($(this).css('padding-right'));
							
							percent = (textWidth / tableWidth) * 100;
							finalWidth = percent.toString() + '%';
						}
						else
						{
							finalWidth = ((100 - percent) / numColumn).toString() + '%';
							
							var text = $(this).text();
							
							if($.isNumeric(text))
							{	
								var value = parseFloat(text);
								
								var intensity = value / maxValue;

								var finalColor = [
									Math.floor(o.minColor[0] * intensity + o.maxColor[0] * (1 - intensity)),
									Math.floor(o.minColor[1] * intensity + o.maxColor[1] * (1 - intensity)),
									Math.floor(o.minColor[2] * intensity + o.maxColor[2] * (1 - intensity)),
									Math.floor(o.minColor[3] * intensity + o.maxColor[3] * (1 - intensity))
								];
				
								var x_label = $(self).find('thead tr:first-child th:nth-child(' + (index + 1) + ')').text();
								var y_label = $(this).parent().find('td.y-label').text();
				
								var element = $('<div>').addClass('paintBox');
								element.css('background-color', 'rgba(' + finalColor.join(', ') + ')');
								
								element.mouseenter(function(event)
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
						}
						$(this).css('width', finalWidth);
					});
				});

			});

			// maintain chainability
			return this;
		}
  });

  $.fn.extend({
    retentionTable: $.fn.retentionTable
  });

})(jQuery);
