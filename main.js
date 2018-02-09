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

Migrations.init = function(){
    const canvas = $("#gameWorld")[0];
    const ctx = canvas.getContext("2d");

    Migrations.Planets = [
        new Migrations.Planet({x: 100, y: 565, size: 5}),
        new Migrations.Planet({x: 400, y: 540, size: 10}),
        new Migrations.Planet({x: 630, y: 180, size: 15}),
        new Migrations.Planet({x: 780, y: 495, size: 20}),
        new Migrations.Planet({x: 260, y: 205, size: 25})
    ];

    let entitiesToAdd = 100;
    const intervalId =  window.setInterval(function(){
        const chosenPlanet = Migrations.Planets[Math.floor(Math.random() * Migrations.Planets.length)];
        if(Math.random() > 0.35){
            chosenPlanet.addEntity({entity: new Migrations.Plant({})});
        }else{
            chosenPlanet.addEntity({entity: new Migrations.Herbivore({})});
        }
        entitiesToAdd -= 1;
        if(entitiesToAdd <= 0){
            window.clearInterval(intervalId);
            console.log("Done!");
        }
    }, 20);

    const engine = new Migrations.Engine({context: ctx, windowWidth: 1050, windowHeight: 700});
    Migrations.Planets.forEach(function(planet){
        engine.addPlanet({planet: planet});
    });
    engine.start();
};
