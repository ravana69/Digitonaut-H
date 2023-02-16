var w = c.width = window.innerWidth,
    h = c.height = window.innerHeight,
    ctx = c.getContext( '2d' ),
    
    opts = {
      
      spacing: 50,
      baseSize: 25,
      addedSize: 20,
      
      multX: 1,
      multY: 1,
      multSum: -.01,
      tickSpeed: .01,
      hueMult: 10,
    },
    
    tick = 0,
		rad = Math.PI / 6,
		sin = Math.sin( rad ),
		cos = Math.cos( rad ),
		xs = [ cos, 0, -cos, -cos, 0, cos ],
		ys = [ -sin, -1, -sin, sin, 1, sin ];

function loop() {
  
  window.requestAnimationFrame( loop );
  
  ctx.fillStyle = 'black';
  ctx.fillRect( 0, 0, w, h );
  
  tick += opts.tickSpeed;
  var addedHue = tick * opts.hueMult,
      difX = Math.sqrt( 3 ) * opts.spacing / 2,
      difY = opts.spacing * 3 / 2,
      limitX = c.width + opts.spacing,
      limitY = c.height + opts.spacing;
  
  for( var x = 0; x < limitX; x += difX*2 ){
		var i = 0;
    
    for( var y = 0; y < limitY; y += difY ){
			++i;
			
			var x1 = x + difX * ( i % 2 );
					xTimesMult = x1 * opts.multX,
					hueX = x1 / limitX * 360 + tick * opts.hueMult,
      		size = opts.baseSize + opts.addedSize * Math.sin( ( xTimesMult + y * opts.multY ) * opts.multSum + tick );
      
      ctx.fillStyle = 'hsl(hue,80%,50%)'.replace( 'hue', hueX );
			ctx.beginPath();
			
			ctx.moveTo( xs[0] * size + x1, ys[0] * size + y );
			for( var n = 1; n < xs.length; ++n )
				ctx.lineTo( xs[n] * size + x1, ys[n] * size + y );
			ctx.fill();
    }
  }
}
loop();

// just handlers and gui related stuff

window.addEventListener( 'resize', function(){
  
  w = c.width = window.innerWidth;
  h = c.height = window.innerHeight;
});
/*
gui = new dat.GUI;
gui.add( opts, 'spacing', 10, 100 );
gui.add( opts, 'baseSize', 0, 100 );
gui.add( opts, 'addedSize', 0, 100 );

gui.add( opts, 'multX', -1, 1 );
gui.add( opts, 'multY', -1, 1 );
gui.add( opts, 'multSum', -.2, .2 );
gui.add( opts, 'tickSpeed', 0, 1 );
gui.add( opts, 'hueMult', 0, 50 );
*/