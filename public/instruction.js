"use strict";
var Instruction = (function () {
    function Instruction(id, name, i, j, k) {
        this.state = 0;
        this.functionalUnitIndex = -1;
        this.id = id;
        this.name = name;
        this.i = i;
        this.j = j;
        this.k = k;
    }
    return Instruction;
}());
exports.Instruction = Instruction;
