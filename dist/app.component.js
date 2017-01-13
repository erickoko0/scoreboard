"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var instruction_1 = require('./instruction');
var functionalUnit_1 = require('./functionalUnit');
var AppComponent = (function () {
    function AppComponent() {
        this.textAreaValue = "L.D F6, 34(R2)\nL.D F2, 45(R3)\nMUL.D F0, F2, F4\nSUB.D F8, F6, F2\nDIV.D F10, F0, F6\nADD.D F6, F8, F2";
        this.instructionExecutionStageClock = {};
        this.instructionFunctionalUnitMap = {};
        this.registersSize = 16;
        this.registers = Array(this.registersSize).fill({ reg: '', ins: -1 });
        this.selectedRegisterStatue = {};
    }
    AppComponent.prototype.init = function () {
        this.functionalUnits = [
            new functionalUnit_1.FunctionalUnit('Integer'),
            new functionalUnit_1.FunctionalUnit('Mult1'),
            new functionalUnit_1.FunctionalUnit('Mult2'),
            new functionalUnit_1.FunctionalUnit('Add'),
            new functionalUnit_1.FunctionalUnit('Divide'),
        ];
        this.instructionExecutionStageClock = {
            'L.D': 1,
            'ADD.D': 2,
            'SUB.D': 2,
            'MUL.D': 10,
            'DIV.D': 40
        };
        this.instructionFunctionalUnitMap = {
            'L.D': [{ functionalUnit: 'Integer', index: 0 }],
            'ADD.D': [{ functionalUnit: 'Add', index: 3 }],
            'SUB.D': [{ functionalUnit: 'Add', index: 3 }],
            'MUL.D': [{ functionalUnit: 'Mult1', index: 1 }, { functionalUnit: 'Mult2', index: 2 }],
            'DIV.D': [{ functionalUnit: 'Divide', index: 4 }]
        };
        this.clock = 0;
        this.instructions = [];
        this.runnedInstructionIndex = -1;
        for (var i = 0; i < this.registersSize; i++) {
            this.registers[i] = { reg: '', ins: -1 };
        }
        this.scoreboardHistory = [];
        this.selectedIndex = 0;
    };
    AppComponent.prototype.readFile = function (evt) {
        var files = evt.target.files;
        var file = files[0];
        this.filePath = file;
        var reader = new FileReader();
        var self = this;
        reader.onload = function () {
            self.parserInput(this.result);
        };
        reader.readAsText(file);
    };
    AppComponent.prototype.reloadFile = function () {
        var reader = new FileReader();
        var self = this;
        reader.onload = function () {
            self.parserInput(this.result);
        };
        reader.readAsText(this.filePath);
    };
    AppComponent.prototype.readTextArea = function () {
        this.parserInput(this.textAreaValue);
    };
    AppComponent.prototype.parserInput = function (input) {
        this.init();
        var lines = input.split('\n');
        for (var i = 0; i < lines.length; i++) {
            var ins = lines[i].split(' ');
            if (ins.length <= 1) {
                continue;
            }
            switch (ins[0]) {
                case 'L.D':
                    var j = ins[2].split('(')[0];
                    var k = ins[2].split('(')[1];
                    k = k.split(')')[0];
                    this.instructions.push(new instruction_1.Instruction(i, 'L.D', ins[1].slice(0, -1), j, k));
                    break;
                case 'ADD.D':
                    this.instructions.push(new instruction_1.Instruction(i, 'ADD.D', ins[1].slice(0, -1), ins[2].slice(0, -1), ins[3]));
                    break;
                case 'SUB.D':
                    this.instructions.push(new instruction_1.Instruction(i, 'SUB.D', ins[1].slice(0, -1), ins[2].slice(0, -1), ins[3]));
                    break;
                case 'MUL.D':
                    this.instructions.push(new instruction_1.Instruction(i, 'MUL.D', ins[1].slice(0, -1), ins[2].slice(0, -1), ins[3]));
                    break;
                case 'DIV.D':
                    this.instructions.push(new instruction_1.Instruction(i, 'DIV.D', ins[1].slice(0, -1), ins[2].slice(0, -1), ins[3]));
                    break;
            }
        }
        this.running();
    };
    AppComponent.prototype.running = function () {
        this.saveStatue();
        while (true) {
            if (this.runnedInstructionIndex >= this.instructions.length - 1) {
                break;
            }
            this.clock++;
            console.log('clock:' + this.clock);
            var functionalUnitState = {};
            for (var i_1 = 0; i_1 < this.functionalUnits.length; i_1++) {
                functionalUnitState[this.functionalUnits[i_1].name] = this.functionalUnits[i_1].busy;
            }
            var i = this.runnedInstructionIndex;
            var notReadRigister = Array(this.registersSize).fill(false);
            var registerState = Array(this.registersSize);
            for (var k = 0; k < this.registersSize; k++) {
                registerState[k] = { reg: this.registers[k]['reg'], ins: this.registers[k]['ins'] };
            }
            while (true) {
                i++;
                var runIssue = false;
                console.log(i);
                if (!this.instructions[i].issue) {
                    var instructionName = this.instructions[i].name;
                    for (var j = 0; j < this.instructionFunctionalUnitMap[instructionName].length; j++) {
                        var index = this.instructionFunctionalUnitMap[instructionName][j].index;
                        var functionalUnitName = this.instructionFunctionalUnitMap[instructionName][j].functionalUnit;
                        if (!functionalUnitState[functionalUnitName]) {
                            this.instructions[i].issue = this.clock;
                            this.instructions[i].state++;
                            this.instructions[i].functionalUnitIndex = index;
                            this.lastestIssue = i;
                            runIssue = true;
                            this.functionalUnits[index].busy = true;
                            this.functionalUnits[index].insId = i;
                            this.functionalUnits[index].op = this.instructions[i].name;
                            this.functionalUnits[index].fi = this.instructions[i].i;
                            this.functionalUnits[index].fj = this.instructions[i].j;
                            this.functionalUnits[index].fk = this.instructions[i].k;
                            var register_i = Number(this.instructions[i].i.split('F')[1]);
                            this.registers[register_i / 2]['reg'] = this.functionalUnits[index].name;
                            this.registers[register_i / 2]['ins'] = i;
                            console.log('%c' + this.instructions[i].name + ' pass issue', 'color: #00f');
                            break;
                        }
                    }
                    if (runIssue) {
                        break;
                    }
                    console.log('%c' + this.instructions[i].name + ' not pass issue', 'color: #f00');
                }
                else if (!this.instructions[i].readOperands) {
                    var conti = true;
                    if (this.instructions[i].i[0] === 'F') {
                        var register_j = Number(this.instructions[i].j.split('F')[1]);
                        var register_k = Number(this.instructions[i].k.split('F')[1]);
                        if ((!isNaN(register_j) && registerState[register_j / 2]['ins'] !== -1 && registerState[register_j / 2]['ins'] < i) ||
                            (!isNaN(register_k) && registerState[register_k / 2]['ins'] !== -1 && registerState[register_k / 2]['ins'] < i)) {
                            conti = false;
                            console.log('%c' + this.instructions[i].name + ' not pass read operands', 'color: #f00');
                        }
                    }
                    if (this.instructions[i].j[0] === 'F') {
                        var register_u = Number(this.instructions[i].j.split('F')[1]);
                        notReadRigister[register_u / 2] = true;
                    }
                    if (this.instructions[i].k[0] === 'F') {
                        var register_u = Number(this.instructions[i].k.split('F')[1]);
                        notReadRigister[register_u / 2] = true;
                    }
                    if (conti) {
                        this.instructions[i].readOperands = this.clock;
                        this.instructions[i].state += 1;
                        console.log('%c' + this.instructions[i].name + ' pass read operands', 'color: #00f');
                        var instructionName = this.instructions[i].name;
                        var index = this.instructions[i].functionalUnitIndex;
                        if (this.functionalUnits[index].timer === -1) {
                            this.functionalUnits[index].timer = this.instructionExecutionStageClock[instructionName];
                            console.log('%c' + this.instructions[i].name + ' start running execution complete', 'color: #f00');
                        }
                    }
                }
                else if (!this.instructions[i].executionComplete) {
                    var index = this.instructions[i].functionalUnitIndex;
                    if (this.functionalUnits[index].timer === 1) {
                        this.functionalUnits[index].timer--;
                        this.instructions[i].executionComplete = this.clock;
                        this.instructions[i].state += 1;
                        console.log('%c' + this.instructions[i].name + ' pass execution complete', 'color: #00f');
                    }
                    else {
                        this.functionalUnits[index].timer -= 1;
                        console.log('%c' + this.functionalUnits[index].timer + ' ' +
                            this.instructions[i].name + ' running execution complete', 'color: #f80');
                    }
                }
                else if (!this.instructions[i].writeResult) {
                    var index = this.instructions[i].functionalUnitIndex;
                    this.functionalUnits[index].timer = -1;
                    var conti = true;
                    if (this.instructions[i].j[0] === 'F') {
                        var register_u = Number(this.instructions[i].i.split('F')[1]);
                        if (notReadRigister[register_u / 2]) {
                            conti = false;
                            console.log('%c' + this.instructions[i].name + ' not pass write result', 'color: #f00');
                        }
                    }
                    if (conti) {
                        console.log('%c' + this.instructions[i].name + ' pass write result', 'color: #00f');
                        this.instructions[i].writeResult = this.clock;
                        this.instructions[i].state += 1;
                        if (this.runnedInstructionIndex === i - 1) {
                            this.runnedInstructionIndex++;
                        }
                        this.functionalUnits[index].busy = false;
                        this.functionalUnits[index].insId = -1;
                        this.functionalUnits[index].op = '';
                        this.functionalUnits[index].fi = '';
                        this.functionalUnits[index].fj = '';
                        this.functionalUnits[index].fk = '';
                        var register_u = Number(this.instructions[i].i.split('F')[1]);
                        this.registers[register_u / 2] = { reg: '', ins: -1 };
                    }
                }
                while (true) {
                    if (this.runnedInstructionIndex !== this.instructions.length - 1 &&
                        this.instructions[this.runnedInstructionIndex + 1].writeResult) {
                        this.runnedInstructionIndex++;
                    }
                    else {
                        break;
                    }
                }
                if (i > this.lastestIssue || i >= this.instructions.length - 1) {
                    break;
                }
            }
            this.saveStatue();
        }
    };
    AppComponent.prototype.saveStatue = function () {
        var instructions = [];
        var functionalUnits = [];
        var registers = [];
        for (var k = 0; k < this.instructions.length; k++) {
            var ins = Object.assign({}, this.instructions[k]);
            instructions.push(ins);
        }
        for (var k = 0; k < this.functionalUnits.length; k++) {
            var func = Object.assign({}, this.functionalUnits[k]);
            functionalUnits.push(func);
        }
        for (var k = 0; k < this.registers.length; k++) {
            var reg = Object.assign({}, this.registers[k]);
            registers.push(reg);
        }
        this.scoreboardHistory.push({
            instructions: instructions,
            functionalUnits: functionalUnits,
            registers: registers
        });
    };
    AppComponent.prototype.headScoreboardIndex = function () {
        this.selectedIndex = 0;
    };
    AppComponent.prototype.endScoreboardIndex = function () {
        this.selectedIndex = this.scoreboardHistory.length - 1;
    };
    AppComponent.prototype.addScoreboardIndex = function () {
        this.selectedIndex++;
        if (this.selectedIndex >= this.scoreboardHistory.length) {
            this.selectedIndex = this.scoreboardHistory.length - 1;
        }
    };
    AppComponent.prototype.subScoreboardIndex = function () {
        this.selectedIndex--;
        if (this.selectedIndex < 0) {
            this.selectedIndex = 0;
        }
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'my-app',
            templateUrl: './html/scoreboard.html',
            styleUrls: ['./stylesheet/scoreboard.css']
        }), 
        __metadata('design:paramtypes', [])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;
