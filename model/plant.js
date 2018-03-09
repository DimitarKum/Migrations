"use strict";
// Global namespace Migrations
var Migrations = Migrations || {};

Migrations.Plant = function(params, flag){
    Migrations.Entity.call(this, {
        x: 50,
        y: 50,
        width: 12,
        height: 8,
        type: Migrations.EntityTypes.Plant,
        startingEnergy: 100
    });
};

Migrations.Plant.prototype.update = function(params){
    const that = this;
    this.prepareUpdate(params);
    if(!this.shouldUpdate){
        return;
    }
    // Migrations.validateParams(params, "timestamp", "context");
    // console.log(params.timestamp);
    switch(this.state){
        case Migrations.EntityStates.OnPlanet:
            this.energy -= 22;
            this.energy += this.planet.getSunEnergy();
            if(this.energy > 50){
                const candidatePlanets = [];
                Migrations.Planets.forEach(function(planet){
                    if(planet !== that.planet && planet.getSunEnergy() > that.planet.getSunEnergy() && 0.002 > Math.random()){
                    // if(planet !== that.planet){
                        candidatePlanets.push(planet);
                    }
                });
                if(candidatePlanets.length > 0){
                    that.migrate({planet: candidatePlanets[Math.floor(Math.random() * candidatePlanets.length)]});
                    this.energy -= 40;
                    return;
                }
            }
            if(this.energy > 185){
                this.reproduce();
            }
            break;
        case Migrations.EntityStates.InSpace:
            // this.energy -= 2;
            Migrations.moveTo({
                mover: this,
                target: this.planetMigratingTo,
                speed: 10
            });
            break;
        case Migrations.EntityStates.Dying:
            break;
        case Migrations.EntityStates.Reproducing:
            if(this.reproductionCounter <= 0){
                const clonedPlant = new Migrations.Plant();
                clonedPlant.energy = 50;
                this.planet.addEntity({entity: clonedPlant});
                this.state = Migrations.EntityStates.OnPlanet;
                return;
            }
            --this.reproductionCounter;
            break;
        default:
            this.state = Migrations.EntityStates.InSpace;
            break;
    }
};
Migrations.Plant.prototype.reproduce = function(){
    this.state = Migrations.EntityStates.Reproducing;
    this.reproductionCounter = 20;
    this.energy = 50;
};
Migrations.Plant.prototype.draw = function(params){
    // Migrations.validateParams(params, "timestamp", "context");
    const ctx = params.context;

    ctx.font = "12px Arial";
    ctx.fillStyle = "rgb("+255+","+255+","+255+")";    
    ctx.fillText(Math.floor(this.energy), this.x - 15, this.y + 15);
    ctx.save();
    let r, g, b, ratio, complement, fertileR, fertileG, fertileB, barrenR, barrenG, barrenB;
    switch(this.state){
        case Migrations.EntityStates.OnPlanet:
            ctx.beginPath();
            ratio = Math.max(0, Math.min(this.energy / 500.0, 1.0));
            complement = 1.0 - ratio;
            fertileR = 32, fertileG = 255, fertileB = 80;
            barrenR = 110, barrenG = 95, barrenB = 75;
            r = Math.floor(fertileR * ratio + barrenR * complement),
                g = Math.floor(fertileG * ratio + barrenG * complement),
                b = Math.floor(fertileB * ratio + barrenB * complement);
            ctx.fillStyle = "rgb("+r+","+g+","+b+")";
            ctx.lineWidth = 3;
            ctx.rect(
                this.x,
                this.y,
                this.width,
                this.height
            );
            ctx.closePath();
            ctx.fill();
            break;
        case Migrations.EntityStates.InSpace:
            // console.log("x = " + this.x + ", y = "+ this.y);
            ctx.beginPath();
            ratio = Math.max(0, Math.min(this.energy / 500.0, 1.0));
            complement = 1.0 - ratio;
            fertileR = 32, fertileG = 255, fertileB = 80;
            barrenR = 110, barrenG = 95, barrenB = 75;
            r = Math.floor(fertileR * ratio + barrenR * complement),
                g = Math.floor(fertileG * ratio + barrenG * complement),
                b = Math.floor(fertileB * ratio + barrenB * complement);
            ctx.fillStyle = "rgb("+r+","+g+","+b+")";
            ctx.lineWidth = 3;
            ctx.rect(
                this.x,
                this.y,
                this.width,
                this.height
            );
            ctx.closePath();
            ctx.fill();
            break;
        case Migrations.EntityStates.Dying:
            ctx.beginPath();
            r = 120, g = 20, b = 35;
            ctx.fillStyle = "rgb("+r+","+g+","+b+")";
            ctx.lineWidth = 3;
            ctx.rect(
                this.x,
                this.y,
                this.width,
                this.height
            );
            ctx.closePath();
            ctx.fill();
            break;
        case Migrations.EntityStates.Reproducing:
            ctx.beginPath();
            ratio = Math.max(0, Math.min(this.energy / 125.0, 1.0));
            complement = 1.0 - ratio;
            fertileR = 32, fertileG = 255, fertileB = 80;
            barrenR = 110, barrenG = 95, barrenB = 75;
            r = Math.floor(fertileR * ratio + barrenR * complement),
                g = Math.floor(fertileG * ratio + barrenG * complement),
                b = Math.floor(fertileB * ratio + barrenB * complement);
            ctx.fillStyle = "rgb("+r+","+g+","+b+")";
            ctx.lineWidth = 3;
            const reproductionProgress = (20 - this.reproductionCounter) / 20;
            const xOffset = 8 * reproductionProgress,
                yOffset = 3 * reproductionProgress,
                sizeScale = 0.55 + 0.30 * (reproductionProgress)
            ctx.rect(
                this.x - xOffset,
                this.y - yOffset,
                Math.floor(this.width * sizeScale),
                Math.floor(this.height * sizeScale)
            );
            ctx.rect(
                this.x + xOffset,
                this.y + yOffset,
                Math.floor(this.width * sizeScale),
                Math.floor(this.height * sizeScale)
            );
            ctx.closePath();
            ctx.fill();
            break;
        default:
            this.state = Migrations.EntityStates.InSpace;
            break;
    }
    ctx.restore();
};