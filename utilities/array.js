Array.prototype.remove = function(element){
    if(this.includes(element)){
        this.splice(this.indexOf(element), 1);
    }else{
        throw new Error("Cannot remove element [" + element + " from array [" + this + "], element is not in the array.");
    }
};