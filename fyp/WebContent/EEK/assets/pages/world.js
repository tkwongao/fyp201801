var world = null;

function GetWorld()
{
	if(!world)
	{
		world = new World();
	}
	
	return world;
}

var World = (function(){
	
	World = function() {
		this.objectList = {};
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.bPause = true;
		this.bDraw = true;
		
		this.beforeTimeMs = Date.now();
		this.elapsedTimeSecs = 0.0;
		this.desiredFPS = 60.0;
		this.accuDeltaSeconds = 0.0;
		this.refreshSeconds = 1.0;
	}
	
	World.prototype.GetObjectById = function(id)
	{
		return this.objectList[id];
	}
	
	World.prototype.Construct = function()
	{		

	}
	
	World.prototype.AfterPlay = function ()
	{
		
	}
	
	World.prototype.BeginPlay = function ()
	{
		
	}
	
	World.prototype.Tick = function(deltaSeconds)
	{
		this.accuDeltaSeconds = this.accuDeltaSeconds - deltaSeconds;

		if(this.accuDeltaSeconds <= 0.0)
		{
			for(var i in this.objectList)
			{
				this.objectList[i].update();
			}
			
			this.bPause = false;
			this.accuDeltaSeconds = this.refreshSeconds;
		}
	}
	
	World.prototype.PostProcessing = function()
	{
		
	}
	
	World.prototype.Render = function()
	{
		if(this.renderer && this.bDraw && !this.bPause)
		{
			this.renderer.clear();
			this.renderer.render( scene, camera );
		}
	}
	
	World.prototype.SceneLoop = function()
	{	
		var self = this;
	
		window.requestAnimationFrame(self.SceneLoop.bind(self));
		
		if(this.elapsedTimeSecs >= (1.0 / this.desiredFPS))
		{
			this.Tick(this.elapsedTimeSecs);
			this.Render();
			this.PostProcessing();
			this.elapsedTimeSecs = 0.0;
		}
		
		var nowTimeMs = Date.now();
		this.elapsedTimeSecs = this.elapsedTimeSecs + ((nowTimeMs - this.beforeTimeMs) / 1000.0);
		this.beforeTimeMs = nowTimeMs;	
	}
	
	World.prototype.Start = function()
	{
		this.Construct();
		this.BeginPlay();
		this.SceneLoop();
		this.AfterPlay();
	}
	
	return World;
})();