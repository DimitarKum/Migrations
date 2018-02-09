"use strict";
// Global namespace Migrations
var Migrations = Migrations || {};

/*
* gameSpeed - currently unused
* frameRate - frames per second
*/
Migrations.Engine = function(params){
    Migrations.validateParams(params, "context", "windowWidth", "windowHeight");
    this.context = params.context;
    this.windowWidth = params.windowWidth;
    this.windowHeight = params.windowHeight;
    this.planets = []
};

Migrations.Engine.prototype.addPlanet = function(params){
    Migrations.validateParams(params, "planet");
    this.planets.push(params.planet);
};

Migrations.Engine.prototype.start = function(){
    const that = this;
    function step(timestamp){
        const drawUpdateParam = {context: that.context, timestamp: timestamp};

        
        that.context.clearRect(0, 0, that.windowWidth, that.windowHeight);

        that.planets.forEach(function(planet){
            planet.update(drawUpdateParam);
        });
        that.planets.forEach(function(planet){
            planet.draw(drawUpdateParam);
        });

        window.requestAnimationFrame(function(timestamp){
            step(timestamp);
        });
    };
    window.requestAnimationFrame(function(timestamp){
        step(timestamp);
    });
};