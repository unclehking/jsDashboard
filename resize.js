(function ($) {
    $.fn.dnd = function(options){
		var $this = $(this);
		var event_state = {};
		var constrain = false;
		var constrain = false,
        min_width = 80, // Change as required
        min_height = 80,
        max_width = 800, // Change as required
        max_height = 900;
		$this.addClass('cWrap')
		$this.wrap('<div class="resize-container"></div>')
	       .before('<span class="resize-handle resize-handle-nw"></span>')
           .before('<span class="resize-handle resize-handle-ne"></span>')
           .after('<span class="resize-handle resize-handle-se"></span>')
           .after('<span class="resize-handle resize-handle-sw"></span>');
        var $container =  $this.parent('.resize-container');

		var saveEventState = function(e){
			// Save the initial event details and container state
	      	event_state.container_width = $container.width();
	      	event_state.container_height = $container.height();
	      	event_state.container_left = $container.offset().left;
	      	event_state.container_top = $container.offset().top;
	      	event_state.mouse_x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft();
	      	event_state.mouse_y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();
	  		// This is a fix for mobile safari
	  		// For some reason it does not allow a direct copy of the touches property
	  		if(typeof e.originalEvent.touches !== 'undefined'){
	  			event_state.touches = [];
	  			$.each(e.originalEvent.touches, function(i, ob){
	  		  		event_state.touches[i] = {};
	  		  		event_state.touches[i].clientX = 0+ob.clientX;
	  		  		event_state.touches[i].clientY = 0+ob.clientY;
	  			});
	  		}
	      	event_state.evnt = e;
	    };

		var startMoving = function(e){
			e.preventDefault();
	      	e.stopPropagation();
	      	saveEventState(e);
		  	$(document).on('mousemove touchmove', moving);
		  	$(document).on('mouseup touchend', endMoving);
	    };

		var endMoving = function(e){
			e.preventDefault();
	      	$(document).off('mouseup touchend', endMoving);
	      	$(document).off('mousemove touchmove', moving);
	    };

	    var moving = function(e){
			var  mouse={}, touches;
	      	e.preventDefault();
	      	e.stopPropagation();
	      	touches = e.originalEvent.touches;
	      	mouse.x = (e.clientX || e.pageX || touches[0].clientX) + $(window).scrollLeft();
	      	mouse.y = (e.clientY || e.pageY || touches[0].clientY) + $(window).scrollTop();
	      	$container.offset({
	        	'left': mouse.x - ( event_state.mouse_x - event_state.container_left ),
	        	'top': mouse.y - ( event_state.mouse_y - event_state.container_top )
	      	});
	      	// Watch for pinch zoom gesture while moving
	      	if(event_state.touches && event_state.touches.length > 1 && touches.length > 1){
	        	var width = event_state.container_width, height = event_state.container_height;
	        	var a = event_state.touches[0].clientX - event_state.touches[1].clientX;
	        	a = a * a;
	        	var b = event_state.touches[0].clientY - event_state.touches[1].clientY;
	        	b = b * b;
	        	var dist1 = Math.sqrt( a + b );
	        	a = e.originalEvent.touches[0].clientX - touches[1].clientX;
	        	a = a * a;
	        	b = e.originalEvent.touches[0].clientY - touches[1].clientY;
	        	b = b * b;
	        	var dist2 = Math.sqrt( a + b );
	        	var ratio = dist2 /dist1;
	        	width = width * ratio;
	        	height = height * ratio;
	        	// To improve performance you might limit how often resizeImage() is called
	        	//resizeImage(width, height);
	      	}
	    };

		var showHandle = function(e){
			$(".resize-container").removeClass('active');
			$(this).addClass('active');
		}

		var startResize = function(e){
	      e.preventDefault();
	      e.stopPropagation();
	      saveEventState(e);
	      $(document).on('mousemove touchmove', resizing);
	      $(document).on('mouseup touchend', endResize);
	    };

	    var endResize = function(e){
	      e.preventDefault();
	      $(document).off('mouseup touchend', endResize);
	      $(document).off('mousemove touchmove', resizing);
	    };

		var resizing = function(e){
	      var mouse={},width,height,left,top,offset=$container.offset();
	      mouse.x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft();
	      mouse.y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();

	      // Position image differently depending on the corner dragged and constraints
	      if( $(event_state.evnt.target).hasClass('resize-handle-se') ){
	        width = mouse.x - event_state.container_left;
	        height = mouse.y  - event_state.container_top;
	        left = event_state.container_left;
	        top = event_state.container_top;
	      } else if($(event_state.evnt.target).hasClass('resize-handle-sw') ){
	        width = event_state.container_width - (mouse.x - event_state.container_left);
	        height = mouse.y  - event_state.container_top;
	        left = mouse.x;
	        top = event_state.container_top;
	      } else if($(event_state.evnt.target).hasClass('resize-handle-nw') ){
			  console.log(235);
	        width = event_state.container_width - (mouse.x - event_state.container_left);
	        //height = event_state.container_height - (mouse.y - event_state.container_top);
			height = width / 2;
	        left = mouse.x;
	        top = mouse.y;

	      } else if($(event_state.evnt.target).hasClass('resize-handle-ne') ){
	        width = mouse.x - event_state.container_left;
	        height = event_state.container_height - (mouse.y - event_state.container_top);
	        left = event_state.container_left;
	        top = mouse.y;

	      }

	      // Optionally maintain aspect ratio

		  $container.css({
			  width: parseInt(width),
			  height: parseInt(height)
		  });
		  $this.css({
			  width: parseInt(width),
			  height: parseInt(height)
		  });
		  // Without this Firefox will not re-calculate the the image dimensions until drag end
		  $container.offset({'left': left, 'top': top});

	    }

		$container.on('mousedown touchstart', 'img , #tDiv', startMoving);
		$container.on('click', '', showHandle);
		$container.on('mousedown touchstart', '.resize-handle', startResize);
    };
})(jQuery);
