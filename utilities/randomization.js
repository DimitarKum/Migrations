"use strict";
// Global namespace Migrations
var Migrations = Migrations || {};

Migrations.drawOdds = function(params){
    Migrations.validateParams(params, "odds", "outOf");
    return params.odds >= Math.random() * params.outOf;
};

Migrations.randInt = function(params){
    Migrations.validateParams(params, "from", "to");
    return Math.floor(params.from + Math.random() * (params.to - params.from + 1));
};