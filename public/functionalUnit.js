"use strict";
var FunctionalUnit = (function () {
    function FunctionalUnit(name) {
        this.timer = -1;
        this.insId = -1;
        this.busy = false;
        this.name = name;
    }
    return FunctionalUnit;
}());
exports.FunctionalUnit = FunctionalUnit;
