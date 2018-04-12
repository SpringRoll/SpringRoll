/**
 * @module PIXI Display
 * @namespace springroll.pixi
 * @requires Core
 */
(function(undefined)
{
	/**
	 * Provides deprecations to features from SpringRoll's fork of Pixi v3 that are now in Pixi v4
	 * @method enableLegacy
	 * @param {PIXI.WebGLRenderer|PIXI.CanvasRenderer} object The render to enable legacy functionality with.
	 */
	function enableLegacy(renderer)
	{
		var interaction = renderer.plugins.interaction;
		if (interaction)
		{
			interaction.on('pointerdown', function(event)
			{
				interaction.emit('stagedown', event);
			});
			interaction.on('pointerup', function(event)
			{
				interaction.emit('stageup', event);
			});
			interaction.on('pointermove', function(event)
			{
				interaction.emit('stagemove', event);
			});
			interaction.on('pointerover', function(event)
			{
				interaction.emit('stageover', event);
			});
			interaction.on('pointerout', function(event)
			{
				interaction.emit('stageout', event);
			});

			Object.defineProperty(interaction, 'handleCursorChange',
			{
				get: function()
				{
					return this.cursorStyles.default;
				},
				set: function(value)
				{
					this.cursorStyles.default = value;
					this.cursorStyles.pointer = value;
				}
			});

			Object.defineProperty(PIXI.interaction.InteractionData.prototype, 'id',
			{
				get: function()
				{
					return this.identifier;
				}
			});
		}
	}
	// Assign to namespace
	namespace('springroll.pixi').enableLegacy = enableLegacy;

}());