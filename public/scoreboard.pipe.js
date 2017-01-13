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
var YesNoPipe = (function () {
    function YesNoPipe() {
    }
    YesNoPipe.prototype.transform = function (value) {
        return value ? 'Yes' : 'No';
    };
    YesNoPipe = __decorate([
        core_1.Pipe({ name: 'YesNo' }), 
        __metadata('design:paramtypes', [])
    ], YesNoPipe);
    return YesNoPipe;
}());
exports.YesNoPipe = YesNoPipe;
var TimerPipe = (function () {
    function TimerPipe() {
    }
    TimerPipe.prototype.transform = function (value) {
        return value === -1 ? '' : String(value);
    };
    TimerPipe = __decorate([
        core_1.Pipe({ name: 'Timer' }), 
        __metadata('design:paramtypes', [])
    ], TimerPipe);
    return TimerPipe;
}());
exports.TimerPipe = TimerPipe;
var QPipe = (function () {
    function QPipe() {
    }
    QPipe.prototype.transform = function (value, i, register) {
        if (!value || value === '' || i == -1) {
            return '';
        }
        var register_index = Number(value.split('F')[1]);
        if (!isNaN(register_index) && register[register_index / 2]['ins'] !== -1 && register[register_index / 2]['ins'] < i) {
            return register[register_index / 2]['reg'];
        }
        return '';
    };
    QPipe = __decorate([
        core_1.Pipe({ name: 'Qpipe', pure: false }), 
        __metadata('design:paramtypes', [])
    ], QPipe);
    return QPipe;
}());
exports.QPipe = QPipe;
var RPipe = (function () {
    function RPipe() {
    }
    RPipe.prototype.transform = function (value, reg) {
        if (value) {
            return 'No';
        }
        else if (reg) {
            return 'Yes';
        }
        else {
            return '';
        }
    };
    RPipe = __decorate([
        core_1.Pipe({ name: 'Rpipe', pure: false }), 
        __metadata('design:paramtypes', [])
    ], RPipe);
    return RPipe;
}());
exports.RPipe = RPipe;
