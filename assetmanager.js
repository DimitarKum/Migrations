"use strict";
// Global namespace Migrations
var Migrations = Migrations || {};

function AssetManager() {
    this.successCount = 0;
    this.errorCount = 0;
    this.cache = [];
    this.downloadQueue = [];
}

AssetManager.prototype.queueDownload = function (path) {
    this.downloadQueue.push(path);
};

AssetManager.prototype.isDone = function () {
    return this.downloadQueue.length === this.successCount + this.errorCount;
}

AssetManager.prototype.downloadAll = function (callback) {
    const that = this;
    this.downloadQueue.forEach(function (path) {
        const img = new Image();

        img.addEventListener("load", function () {
            ++that.successCount;
            if (that.isDone()) {
                callback();
            };
        });

        img.addEventListener("error", function () {
            console.error(Error("Image [" + img + "] could not be loaded!"));
            that.errorCount++;
            if (that.isDone()) {
                callback();
            };
        });

        img.src = path;
        that.cache[path] = img;
    });
};

AssetManager.prototype.getAsset = function (path) {
    return this.cache[path];
};