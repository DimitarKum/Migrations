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
};

Migrations.Herbivore = function(params){
    Migrations.Entity.call(this, {
        x: 80,
        y: 60,
        width: 12,
        height: 8,
        type: Migrations.EntityTypes.Herbivore,
        startingEnergy: 200
    });
};
Migrations.Herbivore.prototype.update = function(params){
    // Migrations.validateParams(params, "timestamp", "context");
    this.prepareUpdate(params);
    if(!this.shouldUpdate){
        return;
    }

    switch(this.state){
        case Migrations.EntityStates.OnPlanet:
            this.energy -= 4.25;
            if(this.energy < 0){
                this.die();
            }
            if(!this.leftSpot.isEmpty() && this.leftSpot.getEntity().type === Migrations.EntityTypes.Plant && this.leftSpot.getEntity().state !== Migrations.EntityStates.Reproducing){
                this.consume({plant: this.leftSpot.getEntity()});
                return;
            }
            if(!this.rightSpot.isEmpty() && this.rightSpot.getEntity().type === Migrations.EntityTypes.Plant && this.rightSpot.getEntity().state !== Migrations.EntityStates.Reproducing){
                this.consume({plant: this.rightSpot.getEntity()});
                return;
            }
            const emptySpots = this.planet.getEmptySpots();
            const spotsWithFood = [];
            emptySpots.forEach(function(emptySpot){
                if(
                    // (Math.pow(this.spot - emptySpot.x, 2) + Math.pow(this.spot - emptySpot.y)) < 50 &&
                    ((!emptySpot.leftSpot.isEmpty() &&
                    emptySpot.leftSpot.getEntity().type === Migrations.EntityTypes.Plant &&
                    emptySpot.leftSpot.getEntity().state !== Migrations.EntityStates.Reproducing) ||
                    (!emptySpot.rightSpot.isEmpty() &&
                    emptySpot.rightSpot.getEntity().type === Migrations.EntityTypes.Plant &&
                    emptySpot.rightSpot.getEntity().state !== Migrations.EntityStates.Reproducing))
                    ){

                    spotsWithFood.push(emptySpot);
                }
            });
            if(spotsWithFood.length > 0 ){
                const chosenSpot = spotsWithFood[Math.floor(Math.random() * spotsWithFood.length)];
                if(chosenSpot.isEmpty()){
                    this.spot.removeEntity();
                    chosenSpot.addEntity({entity: this});
                }
            }
            break;
        case Migrations.EntityStates.InSpace:
            break;
        case Migrations.EntityStates.Dying:
            break;
        case Migrations.EntityStates.Reproducing:
            // this.energy -= 50;
            if(this.reproductionCounter <= 0){
                const clonedHerbivore = new Migrations.Herbivore();
                clonedHerbivore.energy = 50;
                this.planet.addEntity({entity: clonedPlant});
                this.state = Migrations.EntityStates.OnPlanet;
                return;
            }
            --this.reproductionCounter;
            break;
        case Migrations.EntityStates.Consuming:
            if(this.prey.state === Migrations.EntityStates.OnPlanet){
                this.prey.energy -= 9;
                this.energy += 1.75;
            }else{
                this.state = Migrations.EntityStates.OnPlanet;
            }
            break;
        default:
            this.state = Migrations.EntityStates.InSpace;
            break;
    }
};
Migrations.Herbivore.prototype.draw = function(params){
    // Migrations.validateParams(params, "timestamp", "context");
    const ctx = params.context;
    const startX = Math.floor(this.x + this.width / 2), startY = this.y;

    ctx.font = "12px Arial";
    ctx.fillStyle = "rgb("+255+","+255+","+255+")";    
    ctx.fillText(Math.floor(this.energy), this.x - 15, this.y + 15);

    let r, g, b, ratio, complement, fertileR, fertileG, fertileB, barrenR, barrenG, barrenB;
    switch(this.state){
        case Migrations.EntityStates.OnPlanet:
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = "#A010C0";
            ratio = Math.max(0, Math.min(this.energy / 500.0, 1.0));
            complement = 1.0 - ratio;
            fertileR = 185, fertileG = 15, fertileB = 210;
            barrenR = 115, barrenG = 145, barrenB = 5;
            r = Math.floor(fertileR * ratio + barrenR * complement),
                g = Math.floor(fertileG * ratio + barrenG * complement),
                b = Math.floor(fertileB * ratio + barrenB * complement);
            ctx.fillStyle = "rgb("+r+","+g+","+b+")";
            ctx.lineWidth = 3;
            ctx.moveTo(startX, startY);
            ctx.lineTo(this.x, this.y + Math.floor(Math.sqrt(2 / 3) * this.width));
            ctx.lineTo(this.x + this.width, this.y + Math.floor(Math.sqrt(2 / 3) * this.width));
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            break;
        case Migrations.EntityStates.InSpace:
            break;
        case Migrations.EntityStates.Dying:
            ctx.save();
            ctx.beginPath();
            r = 120, g = 20, b = 35;    
            ctx.fillStyle = "rgb("+r+","+g+","+b+")"
            ctx.lineWidth = 3;
            ctx.moveTo(startX, startY);
            ctx.lineTo(this.x, this.y + Math.floor(Math.sqrt(2 / 3) * this.width));
            ctx.lineTo(this.x + this.width, this.y + Math.floor(Math.sqrt(2 / 3) * this.width));
            ctx.closePath();
            ctx.fill();
            ctx.restore();
            break;
        case Migrations.EntityStates.Reproducing:
            break;
        case Migrations.EntityStates.Consuming:
            ctx.save();
            ctx.beginPath();
            ratio = Math.max(0, Math.min(this.energy / 500.0, 1.0));
            complement = 1.0 - ratio;
            fertileR = 185, fertileG = 15, fertileB = 210;
            barrenR = 115, barrenG = 145, barrenB = 5;
            r = Math.floor(fertileR * ratio + barrenR * complement),
                g = Math.floor(fertileG * ratio + barrenG * complement),
                b = Math.floor(fertileB * ratio + barrenB * complement);
            ctx.fillStyle = "rgb("+r+","+g+","+b+")";
            ctx.lineWidth = 3;
            ctx.moveTo(startX, startY);
            ctx.lineTo(this.x, this.y + Math.floor(Math.sqrt(2 / 3) * this.width));
            ctx.lineTo(this.x + this.width, this.y + Math.floor(Math.sqrt(2 / 3) * this.width));
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.strokeStyle = "#C03030";
            ctx.moveTo(startX, startY);
            ctx.lineTo(this.prey.x, this.prey.y);
            ctx.closePath();
            ctx.stroke();

            ctx.restore();
            break;
        default:
            this.state = Migrations.EntityStates.InSpace;
            break;
    }
};


Migrations.Herbivore.prototype.consume = function(params){
    Migrations.validateParams(params, "plant");
    const plant = params.plant;
    this.prey = plant;
    this.state = Migrations.EntityStates.Consuming;
};
