"use strict";
// Global namespace Migrations
var Migrations = Migrations || {};

Migrations.Spot = function(params){
    Migrations.validateParams(params, "baseAngle", "radius", "center");
    // Migrations.validateParams(params.center, "x", "y");
    this.baseAngle = params.baseAngle;
    this.currentAngle = 0;
    this.radius = params.radius;
    this.xOffset = params.center.x;
    this.yOffset = params.center.y;
    this.entity = {};
    this.hasEntity = false;
};
Migrations.Spot.prototype.addEntity = function(params){
    Migrations.validateParams(params, "entity");
    // console.log("Adding entity at spot with baseAngle = " + this.baseAngle);
    this.entity = params.entity;
    this.entity.setAdjescentSpots({
                leftSpot: this.leftSpot,
                currentSpot: this,
                rightSpot: this.rightSpot
            });
    this.updateEntityCoordinates();
    this.hasEntity = true;
};
Migrations.Spot.prototype.removeEntity = function(){
    this.entity = {};
    this.hasEntity = false;
};
Migrations.Spot.prototype.getEntity = function(){
    return this.entity;
};
Migrations.Spot.prototype.updateEntityCoordinates = function(){
    this.entity.x = this.xOffset + this.radius * Math.cos(this.baseAngle + this.currentAngle) - this.entity.width / 2;
    this.entity.y = this.yOffset + this.radius * Math.sin(this.baseAngle + this.currentAngle) - this.entity.height / 2;
};
Migrations.Spot.prototype.isEmpty = function(){
    return !this.hasEntity;
};
Migrations.Spot.prototype.update = function(params){
    // Migrations.validateParams(params, "context", "timestamp");
    this.currentAngle += 1.2 / this.radius;
    this.currentAngle %= 2 * Math.PI;
    if(!this.isEmpty()){
        this.updateEntityCoordinates();
        this.entity.update(params);
    }
};
Migrations.Spot.prototype.draw = function(params){
    // Migrations.validateParams(params, "context", "timestamp");
    if(!this.isEmpty()){
        this.entity.draw(params);
    }
};