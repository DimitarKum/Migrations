"use strict";
// Global namespace Migrations
var Migrations = Migrations || {};

Migrations.EntityTypes = {
    Plant: "Plant",
    Herbivore: "Herbivore"
    // Carnivore: "Carnivore"
};

Migrations.EntityStates = {
    OnPlanet: "OnPlanet",
    InSpace: "InSpace",
    Dying: "Dying",
    Consuming: "Consuming",
    Consumed: "Consumed",
    Reproducing: "Reproducing"
};

Migrations.Entity = function(params){
    // Migrations.validateParams(params, "x", "y", "width", "height", "type", "startingEnergy");
    this.x = params.x;
    this.y = params.y;

    this.width = params.width;
    this.height = params.height;

    this.type = params.type;
    this.state = Migrations.EntityStates.InSpace;

    this.energy = params.startingEnergy;


    this.dieCounter = 0;
    this.lastTimestamp = 0;
    this.timeSinceLastFrame = 0;
    this.updateInterval = 250;
    this.prepareUpdate = function(params){
        // Migrations.validateParams(params, "timestamp");
        if(this.state === Migrations.EntityStates.Dying){
            this.dieCounter -= 1;
            if(this.dieCounter <= 0){
                this.remove();
            }
            return;
        }
        if(this.energy < 0){
            this.shouldUpdate = false;
            this.die();
            return;
        }
        if(this.state === Migrations.EntityStates.InSpace){
            if(Migrations.distance({entity1: this, entity2: this.planetMigratingTo}) < 5){

                Migrations.GlobalEngine.removeEntity({entity: this});
                this.planetMigratingTo.addEntity({entity: this});
            }
        }
        // console.log("YEP");
        this.shouldUpdate = false;
        this.timeSinceLastFrame += params.timestamp - this.lastTimestamp;
        if(this.timeSinceLastFrame > this.updateInterval){
            this.shouldUpdate = true;
            this.timeSinceLastFrame %= this.updateInterval;
        }
        this.lastTimestamp = params.timestamp;
    };
    this.die = function(){
        this.state = Migrations.EntityStates.Dying;
        this.planet.removeEntity({entity: this});
        this.dieCounter = 150;
    };
    this.remove = function(){
        this.spot.removeEntity();
    };

    this.dock = function(params){
        Migrations.validateParams(params, "planet");
        this.planet = params.planet;
        this.state = Migrations.EntityStates.OnPlanet;
    };

    this.setAdjescentSpots = function(params){
        Migrations.validateParams(params, "currentSpot", "leftSpot", "rightSpot");
        this.leftSpot = params.leftSpot;
        this.spot = params.currentSpot;
        this.rightSpot = params.rightSpot;
    };
    this.migrate = function(params){
        Migrations.validateParams(params, "planet");
        const planet = params.planet;
        this.state = Migrations.EntityStates.InSpace;
        // this.remove();
        this.planet.removeEntity({entity: this});
        this.spot.removeEntity();
        Migrations.GlobalEngine.addEntity({entity: this});
        this.planetMigratingTo = planet;
    }

};



Migrations.distance = function(params){
    // Migrations.validateParams(params, "entity1", "entity2");
    return Math.sqrt((params.entity1.x - params.entity2.x) * (params.entity1.x - params.entity2.x) + 
        (params.entity1.y - params.entity2.y) * (params.entity1.y - params.entity2.y));

};

Migrations.centerOf = function(entity){
    return {
        x: entity.x + Math.floor(entity.width / 2.0),
        y: entity.y + Math.floor(entity.height / 2.0),
    }
};

Migrations.moveTo = function(params){
    // Migrations.validateParams(params, "mover", "target", "speed");
    const target = params.target, mover = params.mover, speed = params.speed;
    const dx = (target.x - mover.x), dy = (target.y - mover.y);
    const s = speed / Math.sqrt(dx * dx + dy * dy);
    const resultingDx = s * dx, resultingDy = s * dy;
    mover.x += resultingDx;
    mover.y += resultingDy;
};
