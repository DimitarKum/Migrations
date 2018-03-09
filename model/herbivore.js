Migrations.Herbivore = function(params){
    Migrations.Entity.call(this, {
        x: 80,
        y: 60,
        width: 12,
        height: 8,
        type: Migrations.EntityTypes.Herbivore,
        startingEnergy: 150
    });
};
Migrations.Herbivore.prototype.update = function(params){
    // Migrations.validateParams(params, "timestamp", "context");
    const that = this;
    this.prepareUpdate(params);
    if(!this.shouldUpdate){
        return;
    }

    switch(this.state){
        case Migrations.EntityStates.OnPlanet:
            // this.energy -= 2.75;
            this.energy -= 5.25;
            if(this.energy < 0){
                this.die();
            }
            if(this.energy > 50){
                const candidatePlanets = [];
                Migrations.Planets.forEach(function(planet){
                    if(planet !== that.planet && planet.plants / (planet.herbivores + 0.1) > that.planet.plants / (that.planet.herbivores + 0.1) && 0.015 > Math.random()){
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
            if(!this.leftSpot.isEmpty() && this.leftSpot.getEntity().type === Migrations.EntityTypes.Plant &&
                this.leftSpot.getEntity().state !== Migrations.EntityStates.InSpace &&
                this.leftSpot.getEntity().state !== Migrations.EntityStates.Dying){
                this.consume({plant: this.leftSpot.getEntity()});
                return;
            }
            if(!this.rightSpot.isEmpty() && this.rightSpot.getEntity().type === Migrations.EntityTypes.Plant &&
                this.rightSpot.getEntity().state !== Migrations.EntityStates.InSpace &&
                this.rightSpot.getEntity().state !== Migrations.EntityStates.Dying){
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
            Migrations.moveTo({
                mover: this,
                target: this.planetMigratingTo,
                speed: 10
            });
            break;
        case Migrations.EntityStates.Dying:
            break;
        case Migrations.EntityStates.Reproducing:
            // this.energy -= 50;
            if(this.reproductionCounter <= 0){
                const clonedHerbivore = new Migrations.Herbivore();
                clonedHerbivore.energy = 50;
                this.planet.addEntity({entity: clonedHerbivore});
                this.state = Migrations.EntityStates.OnPlanet;
                return;
            }
            --this.reproductionCounter;
            break;
        case Migrations.EntityStates.Consuming:
            if(this.energy > 185){
                this.reproduce();
            }
            if(this.prey.state === Migrations.EntityStates.OnPlanet){
                const bonusEnergy = 0.42 * this.prey.energy;
                // const bonusEnergy = 0.05 * this.prey.energy;
                this.prey.energy -= 2 + bonusEnergy;
                this.energy += 4 + bonusEnergy;
            }else if(this.prey.state === Migrations.EntityStates.Reproducing){
                this.prey.energy -= 1;
                this.energy += 1;
            }else if(this.prey.state === Migrations.EntityStates.Dying ||
                this.prey.state === Migrations.EntityStates.InSpace){
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
            ratio = Math.max(0, Math.min(this.energy / 140.0, 1.0));
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
            ctx.save();
            ctx.beginPath();
            ctx.fillStyle = "#A010C0";
            ratio = Math.max(0, Math.min(this.energy / 140.0, 1.0));
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
            ctx.save();
            ctx.fillStyle = "#A010C0";
            ratio = Math.max(0, Math.min(this.energy / 140.0, 1.0));
            complement = 1.0 - ratio;
            fertileR = 185, fertileG = 15, fertileB = 210;
            barrenR = 115, barrenG = 145, barrenB = 5;
            r = Math.floor(fertileR * ratio + barrenR * complement),
                g = Math.floor(fertileG * ratio + barrenG * complement),
                b = Math.floor(fertileB * ratio + barrenB * complement);
            ctx.fillStyle = "rgb("+r+","+g+","+b+")";
            ctx.lineWidth = 3;
            const reproductionProgress = (20 - this.reproductionCounter) / 20;
            const xOffset = 8 * reproductionProgress,
                yOffset = 3 * reproductionProgress,
                sizeScale = 0.55 + 0.30 * (reproductionProgress);

            ctx.beginPath();
            ctx.moveTo(
                startX - xOffset,
                startY - yOffset
                );
            ctx.lineTo(
                this.x - xOffset,
                this.y + Math.floor(Math.sqrt(2 / 3) * this.width * reproductionProgress) - yOffset
                );
            ctx.lineTo(
                this.x + this.width * reproductionProgress - xOffset,
                this.y + Math.floor(Math.sqrt(2 / 3) * this.width * reproductionProgress) - yOffset
                );
            ctx.closePath();
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(
                startX + xOffset,
                startY + yOffset
                );
            ctx.lineTo(
                this.x + xOffset,
                this.y + Math.floor(Math.sqrt(2 / 3) * this.width * reproductionProgress) + yOffset
                );
            ctx.lineTo(
                this.x + this.width * reproductionProgress + xOffset,
                this.y + Math.floor(Math.sqrt(2 / 3) * this.width * reproductionProgress) + yOffset
                );
            ctx.closePath();
            ctx.fill();

            ctx.restore();
            break;
        case Migrations.EntityStates.Consuming:
            ctx.save();
            ctx.beginPath();
            ratio = Math.max(0, Math.min(this.energy / 140.0, 1.0));
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

Migrations.Herbivore.prototype.reproduce = function(){
    this.state = Migrations.EntityStates.Reproducing;
    this.reproductionCounter = 20;
    this.energy = 50;
};