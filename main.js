"use strict";
// Global namespace Migrations
var Migrations = Migrations || {};


// fork in a branch called gh-pagess
$('document').ready(function(){
    Migrations.assetManager = new AssetManager();
    // const assetManager = new AssetManager();

    // Migrations.queueAllAssets();
    // Migrations.assetManager.downloadAll(function(){
    //     Migrations.init();
    // });

    Migrations.init();
});

Migrations.queueAllAssets = function(){
};

Migrations.GlobalEngine = {};
Migrations.init = function(){
    const canvas = $("#gameWorld")[0];
    const ctx = canvas.getContext("2d");

    Migrations.Planets = [
        new Migrations.Planet({x: 100, y: 565, size: 5, id: 0}),
        new Migrations.Planet({x: 400, y: 540, size: 10, id: 1}),
        new Migrations.Planet({x: 610, y: 180, size: 15, id: 2}),
        new Migrations.Planet({x: 750, y: 495, size: 20, id: 3}),
        new Migrations.Planet({x: 240, y: 205, size: 25, id: 4})
    ];
    const plant1 = new Migrations.Plant({});
    Migrations.Planets[0].addEntity({entity: new Migrations.Plant({})});
    Migrations.Planets[0].addEntity({entity: new Migrations.Herbivore({})});

    Migrations.GlobalEngine = new Migrations.Engine({context: ctx, windowWidth: 1050, windowHeight: 700});
    Migrations.Planets.forEach(function(planet){
        Migrations.GlobalEngine.addPlanet({planet: planet});
    });
    Migrations.GlobalEngine.start();

    const socket = io.connect("http://24.16.255.56:8888");
    socket.on("load", function (data){
        Migrations.GlobalEngine.entities = [];
        Migrations.Planets.forEach(function(planet){
            planet.removeAllEntities();
            planet.herbivores = 0;
            planet.plants = 0;
        });
        const entityInfos = data.data;
        entityInfos.forEach(function(entityInfo){
            Migrations.createEntityFor(entityInfo);   
        });
    });

    document.getElementById("btnSave").addEventListener("click", function(){        
        const entityInfos = [];
        Migrations.Planets.forEach(function(planet){
            const entities = planet.getEntities();
            entities.forEach(function(entity){
                entityInfos.push(Migrations.serializeEntity(entity));
            });
        });
        Migrations.GlobalEngine.entities.forEach(function(entity){
            entityInfos.push(Migrations.serializeEntity(entity));
        });
        socket.emit("save", { studentname: "Dimitar Kumanov", statename: "myOnlyState", data: entityInfos});
    });
    document.getElementById("btnLoad").addEventListener("click", function(){
        socket.emit("load", { studentname: "Dimitar Kumanov", statename: "myOnlyState"});
    });
};

Migrations.serializeEntity = function(entity){
    let state = entity.state;
    if(state === Migrations.EntityStates.Consuming){
        state = Migrations.EntityStates.OnPlanet;
    }
    let planet = -1;
    if(state !== Migrations.EntityStates.InSpace){
        planet = entity.planet.id;
    }
    let planetMigratingTo = -1;
    if(state === Migrations.EntityStates.InSpace){
        planetMigratingTo = entity.planetMigratingTo.id;
    }
    const entityInfo = new Migrations.EntityInfo({
        type: entity.type,
        energy: Math.floor(entity.energy),
        state: state,
        planet: planet,
        planetMigratingTo: planetMigratingTo,
        x: Math.floor(entity.x),
        y: Math.floor(entity.y),
        reproductionCounter: entity.reproductionCounter,
        dieCounter: entity.dieCounter
    });
    return entityInfo;
};

Migrations.EntityInfo = function(params){
    // Migrations.validateParams(params, "type", "energy", "state");
    // Optional:
    // Migrations.validateParams(params, "planet", "planetMigratingTo", "x", "y", "reproductionCounter", "dieCounter");
    this.type = params.type;
    this.energy = params.energy;
    this.state = params.state;
    
    this.planet = params.planet;
    this.planetMigratingTo = params.planetMigratingTo;
    this.x = params.x;
    this.y = params.y;
    this.reproductionCounter = params.reproductionCounter;
    this.dieCounter = params.dieCounter;
};

Migrations.createEntityFor = function(entityInfo){
    const entity = Migrations.getEntityFor(entityInfo);
    if(entityInfo.state === Migrations.EntityStates.InSpace){
        Migrations.GlobalEngine.addEntity({entity: entity});
        entity.planetMigratingTo = Migrations.Planets[entityInfo.planetMigratingTo];
    }else{
        Migrations.Planets[entityInfo.planet].addEntity({entity: entity});
    }
};

Migrations.getEntityFor = function(entityInfo){
    if(entityInfo.type === Migrations.EntityTypes.Plant){
        const entity = new Migrations.Plant({});
        entity.energy = entityInfo.energy;
        entity.state = entityInfo.state;
        entity.x = entityInfo.x;
        entity.y = entityInfo.y;
        entity.reproductionCounter = entityInfo.reproductionCounter;
        entity.dieCounter = entityInfo.dieCounter;
        return entity;
    }else if(entityInfo.type === Migrations.EntityTypes.Herbivore){
        const entity = new Migrations.Herbivore({});
        entity.energy = entityInfo.energy;
        entity.state = entityInfo.state;
        entity.x = entityInfo.x;
        entity.y = entityInfo.y;
        entity.reproductionCounter = entityInfo.reproductionCounter;
        entity.dieCounter = entityInfo.dieCounter;
        return entity;
    }else{
        console.log("Unknown type " + entityInfo.type);
    }
};