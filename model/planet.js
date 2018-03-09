"use strict";
// Global namespace Migrations
var Migrations = Migrations || {};

Migrations.Planet = function(params){
    Migrations.validateParams(params, "x", "y", "size", "id");
    if(params.size > 25){
        throw new Error("Maximum planet size exceeded.([" + params.size + "] was passed, 25 is maximum.");
    }

    this.id = params.id;
    this.x = params.x;
    this.y = params.y;

    this.radius = params.size * 5;
    this.energy = params.size * 200;
    this.rings = [];

    this.plants = 0;
    this.herbivores = 0;

    // const entityCount = 0;
    // this.addEntity({entity: new Migrations.Plant({})});    
    // const entityCount = Math.floor(15 + Math.random() * params.size * params.size / 8.0);
    // for(let i = 0; i < entityCount; ++i){
    //     if(Math.random() > 0.25){
    //         this.addEntity({entity: new Migrations.Plant({})});
    //     }else{
    //         this.addEntity({entity: new Migrations.Herbivore({})});
    //     }
    // }
};

Migrations.Planet.prototype.getSunEnergy = function(){
    return 10 + this.energy / (20 + 10 * this.plants);
};


Migrations.Planet.prototype.getEmptySpots = function(){
    const emptySpots = [];
    this.rings.forEach(function(ring){
        const ringEmptySpots = ring.getEmptySpots();
        ringEmptySpots.forEach(function(emptySpot){
            emptySpots.push(emptySpot);
        });
    });
    return emptySpots;
};

Migrations.Planet.prototype.addEntity = function(params){
    Migrations.validateParams(params, "entity");
    let spotFound = false;
    const entity = params.entity;
    this.rings.forEach(function(ring){
        if(ring.hasSpots() && !spotFound){
            ring.addEntity({entity: entity});
            spotFound = true;
        }
    });
    if(!spotFound){
        this.rings.push(new Migrations.Ring({
            baseRadius: this.radius,
            level: 1 + this.rings.length,
            center: {x: this.x, y: this.y}}
        ));
        this.rings[this.rings.length - 1].addEntity({entity: entity});
    }

    entity.dock({planet: this});
    switch(entity.type){
        case Migrations.EntityTypes.Plant:
            // this.plants.push(entity);
            this.plants += 1;
            break;
        case Migrations.EntityTypes.Herbivore:
            // this.herbivores.push(entity);
            this.herbivores += 1;
            break;
        default:
            break;
    }
};

Migrations.Planet.prototype.removeEntity = function(params){
    Migrations.validateParams(params, "entity");
    const entity = params.entity, spot = params.spot;
    switch(entity.type){
        case Migrations.EntityTypes.Plant:
            // this.plants.remove(entity);
            this.plants -= 1;
            break;
        case Migrations.EntityTypes.Herbivore:
            this.herbivores -= 1;
            // this.herbivores.remove(entity);
            break;
        default:
            break;
    }
};

Migrations.Planet.prototype.removeAllEntities = function(){
    this.rings.forEach(function(ring){
        ring.spots.forEach(function(spot){
            if(spot.hasEntity){
                spot.entity.remove();
            }
        });
    });
};

Migrations.Planet.prototype.getEntities = function(){
    const entities = [];
    this.rings.forEach(function(ring){
        ring.spots.forEach(function(spot){
            if(spot.hasEntity){
                entities.push(spot.entity);
            }
        });
    });
    return entities;
};

Migrations.Planet.prototype.update = function(params){
    // Migrations.validateParams(params, "timestamp", "context");
    this.rings.forEach(function(ring){
        ring.update(params);
    });
};

Migrations.Planet.prototype.draw = function(params){
    // Migrations.validateParams(params, "timestamp", "context");
    const ctx = params.context;

    ctx.save();
    // ctx.fillStyle = "#906040";
    const ratio = Math.min(this.getSunEnergy() / 25.0 , 1.0);
    const complement = 1.0 - ratio;
    const fertileR = 248, fertileG = 232, fertileB = 8;
    const barrenR = 78, barrenG = 122, barrenB = 222;
    const r = Math.floor(fertileR * ratio + barrenR * complement),
        g = Math.floor(fertileG * ratio + barrenG * complement),
        b = Math.floor(fertileB * ratio + barrenB * complement);
    // const r = Math.floor(20 + this.energy / 55), g = Math.floor(15 + this.energy / 30), b = 25;
    ctx.fillStyle = "rgb("+r+","+g+","+b+")";
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, 2 * Math.PI, true);

    ctx.closePath();
    ctx.fill();

    ctx.font = "30px Arial";
    ctx.fillStyle = "rgb("+0+","+0+","+50+")";    
    ctx.fillText(Math.floor(this.getSunEnergy()), this.x - 15, this.y + 15);

    ctx.restore();
    this.rings.forEach(function(ring){
        ring.draw(params);
    });
};