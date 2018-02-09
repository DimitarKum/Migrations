"use strict";
// Global namespace Migrations
var Migrations = Migrations || {};

Migrations.Ring = function(params){
    // Migrations.validateParams(params, "baseRadius", "level", "center");
    // Migrations.validateParams(params.center, "x", "y");
    this.radius = params.baseRadius + params.level * 22 - 10;
    this.center = params.center;
    this.level = params.level;

    this.capacity = Math.floor(2 * Math.PI * this.radius / 32.0);
    this.spots = [];
    for(let i = 0; i < this.capacity; ++i){
        this.spots[i] = new Migrations.Spot({baseAngle: Math.PI * 2 * i / this.capacity, radius: this.radius, center: this.center});
    }
    for(let i = 0; i < this.capacity; ++i){
        const leftSpot = i > 0 ? this.spots[i - 1] : this.spots[this.spots.length - 1],
                rightSpot = i < this.spots.length - 1 ? this.spots[i + 1] : this.spots[0];
        this.spots[i].leftSpot = leftSpot;
        this.spots[i].rightSpot = rightSpot;
    }
};

Migrations.Ring.prototype.getEmptySpots = function(){
    if(this.isFull()){
        return [];
    }
    const emptySpots = [];
    this.spots.forEach(function(spot){
        if(spot.isEmpty()){
            emptySpots.push(spot);
        }
    });
    return emptySpots;
};

Migrations.Ring.prototype.hasSpots = function(){
    return !this.isFull();
};

Migrations.Ring.prototype.isFull = function(){
    let spotsTaken = 0;
    this.spots.forEach(function(spot){
        if(!spot.isEmpty()){
            spotsTaken += 1;
        }
    });
    return spotsTaken >= this.capacity;
};

Migrations.Ring.prototype.addEntity = function(params){
    Migrations.validateParams(params, "entity");
    const entity = params.entity;
    for(let i = 0; i < this.capacity; ++i){
        const currentSpot = this.spots[i];
        if(currentSpot.isEmpty()){
            this.spots[i].addEntity({entity: entity});
            ++this.spotsTaken;
            break;
        }
    }
};

Migrations.Ring.prototype.removeEntity = function(params){
    // Migrations.validateParams(params, "entity");
};
Migrations.Ring.prototype.update = function(params){
    // Migrations.validateParams(params, "context", "timestamp");
    this.spots.forEach(function(spot){
        spot.update(params);
    });
};
Migrations.Ring.prototype.draw = function(params){
    // Migrations.validateParams(params, "context", "timestamp");
    this.spots.forEach(function(spot){
        spot.draw(params);
    });
};