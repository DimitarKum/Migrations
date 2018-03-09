"use strict";
// Global namespace Migrations
var Migrations = Migrations || {};

//Verfies that the object compositeParameter contains all arguments
Migrations.validateParams = function(compositeParameter, ...propertyNames){
    propertyNames.forEach(function(propertyName){
        if(compositeParameter[propertyName] == null){
            console.dir(compositeParameter);
            console.log(compositeParameter);
            console.log(propertyName);
            throw new Error("Parameter " + compositeParameter + " is missing the following property [" + propertyName + "].");
        }
    });
    // for(let i = 1; i < arguments.length; ++i){
    //     if(arguments[i] == null){
    //         throw new Error('Parameter object is missing the following property [' + arguments[i] + '].');
    //     }
    // };
};