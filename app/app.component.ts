import { Component } from '@angular/core';
import { Instruction } from './instruction';
import { FunctionalUnit } from './functionalUnit';


@Component({
    selector: 'my-app',
    templateUrl: './html/scoreboard.html',
    styleUrls: ['./stylesheet/scoreboard.css']

})

export class AppComponent  {
    textAreaValue: string = `L.D F6, 34(R2)
L.D F2, 45(R3)
MUL.D F0, F2, F4
SUB.D F8, F6, F2
DIV.D F10, F0, F6
ADD.D F6, F8, F2`;
    filePath: Blob;
    instructions: Instruction [];
    functionalUnits: FunctionalUnit[];

    instructionExecutionStageClock = {};

    instructionFunctionalUnitMap = {};

    registersSize: number = 16;
    registers = Array(this.registersSize).fill({reg: '', ins: -1});

    clock: number;
    lastestIssue: number;

    selectedIndex: number;
    selectedInstruction: Instruction;
    selectedFunctionalUnit: FunctionalUnit;
    selectedRegisterStatue = {};
    scoreboardHistory: any;

    runnedInstructionIndex: number;

    init(): void {
        this.functionalUnits = [
            new FunctionalUnit('Integer'),
            new FunctionalUnit('Mult1'),
            new FunctionalUnit('Mult2'),
            new FunctionalUnit('Add'),
            new FunctionalUnit('Divide'),
        ];

        this.instructionExecutionStageClock = {
            'L.D':  1,
            'ADD.D': 2,
            'SUB.D': 2,
            'MUL.D': 10,
            'DIV.D': 40
        };

        this.instructionFunctionalUnitMap = {
            'L.D': [{functionalUnit: 'Integer', index: 0}],
            'ADD.D': [{functionalUnit: 'Add', index: 3}],
            'SUB.D': [{functionalUnit: 'Add', index: 3}],
            'MUL.D': [{functionalUnit: 'Mult1', index: 1}, {functionalUnit: 'Mult2', index: 2}],
            'DIV.D': [{functionalUnit: 'Divide', index: 4}]
        };
        this.clock = 0;
        this.instructions = [];
        this.runnedInstructionIndex = -1;
        for (let i = 0; i < this.registersSize; i++) {
            this.registers[i] = { reg: '', ins: -1 };
        }
        this.scoreboardHistory = [];
        this.selectedIndex = 0;
    }

    readFile(evt: any): void {
        let files = evt.target.files;
        let file = files[0];
        this.filePath = file;
        let reader = new FileReader();
        let self = this;
        reader.onload = function() {
            self.parserInput(this.result);
        }
        reader.readAsText(file);
    }

    reloadFile(): void {
        let reader = new FileReader();
        let self = this;
        reader.onload = function() {
            self.parserInput(this.result);
        }
        reader.readAsText(this.filePath);
    }

    readTextArea(): void {
        this.parserInput(this.textAreaValue);
    }

    parserInput( input: string): void {
        this.init();
        let lines = input.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let ins = lines[i].split(' ');
            if (ins.length <= 1) {
               continue;
            }
            switch (ins[0]) {
                case 'L.D':
                    let j = ins[2].split('(')[0];
                    let k = ins[2].split('(')[1];
                    k = k.split(')')[0];
                    this.instructions.push(
                        new Instruction( i, 'L.D', ins[1].slice(0, -1), j, k)
                    );
                    break;
                 case 'ADD.D':
                    this.instructions.push(
                        new Instruction( i, 'ADD.D', ins[1].slice(0, -1), ins[2].slice(0, -1), ins[3])
                    );
                    break;
                 case 'SUB.D':
                    this.instructions.push(
                        new Instruction( i, 'SUB.D', ins[1].slice(0, -1), ins[2].slice(0, -1), ins[3])
                    );
                    break;
                 case 'MUL.D':
                    this.instructions.push(
                        new Instruction( i, 'MUL.D', ins[1].slice(0, -1), ins[2].slice(0, -1), ins[3])
                    );
                    break;
                 case 'DIV.D':
                    this.instructions.push(
                        new Instruction( i, 'DIV.D', ins[1].slice(0, -1), ins[2].slice(0, -1), ins[3])
                    );
                    break;
            }
        }
        this.running();
    }

    running(): void {
        this.saveStatue();
        while (true) {
            if ( this.runnedInstructionIndex >= this.instructions.length - 1) {
                break;
            }
            this.clock ++;
            console.log('clock:' + this.clock);

            let functionalUnitState = {};
            for (let i = 0; i < this.functionalUnits.length; i++) {
                functionalUnitState[this.functionalUnits[i].name] = this.functionalUnits[i].busy;
            }

            let i = this.runnedInstructionIndex;
            let notReadRigister = Array(this.registersSize).fill(false);
            let registerState = Array(this.registersSize);
            for (let k = 0; k < this.registersSize; k++) {
                registerState[k] = {reg: this.registers[k]['reg'], ins: this.registers[k]['ins']};
            }

            while (true) {
                i ++;
                let runIssue = false;
                console.log(i);
                if (!this.instructions[i].issue) {
                    let instructionName = this.instructions[i].name;
                    for (let j = 0; j < this.instructionFunctionalUnitMap[instructionName].length; j++) {
                        let index = this.instructionFunctionalUnitMap[instructionName][j].index;
                        let functionalUnitName = this.instructionFunctionalUnitMap[instructionName][j].functionalUnit;
                        if (!functionalUnitState[functionalUnitName]) {
                            this.instructions[i].issue = this.clock;
                            this.instructions[i].state ++;
                            this.instructions[i].functionalUnitIndex = index;
                            this.lastestIssue = i;
                            runIssue = true;
                            this.functionalUnits[index].busy = true;
                            this.functionalUnits[index].insId = i;
                            this.functionalUnits[index].op = this.instructions[i].name;
                            this.functionalUnits[index].fi = this.instructions[i].i;
                            this.functionalUnits[index].fj = this.instructions[i].j;
                            this.functionalUnits[index].fk = this.instructions[i].k;

                            let register_i = Number(this.instructions[i].i.split('F')[1]);
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
                } else if (!this.instructions[i].readOperands) {
                    let conti: Boolean = true;
                    if (this.instructions[i].i[0] === 'F') {
                        let register_j = Number(this.instructions[i].j.split('F')[1]);
                        let register_k = Number(this.instructions[i].k.split('F')[1]);
                        if (( !isNaN(register_j) && registerState[register_j / 2]['ins'] !== -1 && registerState[register_j / 2]['ins'] < i) ||
                            ( !isNaN(register_k) && registerState[register_k / 2]['ins'] !== -1 && registerState[register_k / 2]['ins'] < i)) {
                            conti = false;
                            console.log('%c' + this.instructions[i].name + ' not pass read operands', 'color: #f00');
                        }
                    }
                    if (this.instructions[i].j[0] === 'F') {
                        let register_u = Number(this.instructions[i].j.split('F')[1]);
                        notReadRigister[register_u / 2] = true;
                    }
                    if (this.instructions[i].k[0] === 'F') {
                        let register_u = Number(this.instructions[i].k.split('F')[1]);
                        notReadRigister[register_u / 2] = true;
                    }
                    if (conti) {
                        this.instructions[i].readOperands = this.clock;
                        this.instructions[i].state += 1;
                        console.log('%c' + this.instructions[i].name + ' pass read operands', 'color: #00f');

                        let instructionName = this.instructions[i].name;
                        let index = this.instructions[i].functionalUnitIndex;
                        if (this.functionalUnits[index].timer === -1 ) {
                            this.functionalUnits[index].timer = this.instructionExecutionStageClock[instructionName];
                            console.log('%c' + this.instructions[i].name + ' start running execution complete', 'color: #f00');
                        }
                    }
                } else if (!this.instructions[i].executionComplete) {
                    let index = this.instructions[i].functionalUnitIndex;

                    if (this.functionalUnits[index].timer === 1 ) {
                        this.functionalUnits[index].timer --;
                        this.instructions[i].executionComplete = this.clock;
                        this.instructions[i].state += 1;
                        console.log('%c' + this.instructions[i].name + ' pass execution complete', 'color: #00f');
                    } else {
                        this.functionalUnits[index].timer -= 1;
                        console.log('%c' + this.functionalUnits[index].timer + ' ' +
                                        this.instructions[i].name + ' running execution complete', 'color: #f80');
                    }
                } else if (!this.instructions[i].writeResult) {
                    let index = this.instructions[i].functionalUnitIndex;
                    this.functionalUnits[index].timer = -1;
                    let conti: Boolean = true;
                    if (this.instructions[i].j[0] === 'F') {
                        let register_u = Number(this.instructions[i].i.split('F')[1]);
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
                            this.runnedInstructionIndex ++;
                        }
                        this.functionalUnits[index].busy = false;
                        this.functionalUnits[index].insId = -1;
                        this.functionalUnits[index].op = '';
                        this.functionalUnits[index].fi = '';
                        this.functionalUnits[index].fj = '';
                        this.functionalUnits[index].fk = '';

                        let register_u = Number(this.instructions[i].i.split('F')[1]);
                        this.registers[register_u / 2] = { reg: '', ins: -1};
                    }
                }
                while (true) {
                    if (this.runnedInstructionIndex !== this.instructions.length - 1 &&
                        this.instructions[this.runnedInstructionIndex + 1].writeResult
                        ) {
                        this.runnedInstructionIndex ++;
                    } else {
                        break;
                    }
                }

                if (i > this.lastestIssue || i >= this.instructions.length - 1) {
                    break;
                }
            }
            this.saveStatue();
        }
    }

    saveStatue(): void {
        let instructions: Instruction [] = [];
        let functionalUnits: FunctionalUnit [] = [];
        let registers: any = [];
        for ( let k = 0; k < this.instructions.length; k++) {
            let ins: Instruction = Object.assign({}, this.instructions[k]);
            instructions.push(ins);
        }
        for ( let k = 0; k < this.functionalUnits.length; k++) {
            let func: FunctionalUnit = Object.assign({}, this.functionalUnits[k]);
            functionalUnits.push(func);
        }
        for ( let k = 0; k < this.registers.length; k++ ){
            let reg = Object.assign({}, this.registers[k]);
            registers.push(reg);
        }

        this.scoreboardHistory.push({
            instructions: instructions,
            functionalUnits: functionalUnits,
            registers: registers
        })

    }
    headScoreboardIndex(): void {
        this.selectedIndex = 0;
    }
    
    endScoreboardIndex(): void {
        this.selectedIndex = this.scoreboardHistory.length -1;
    }

    addScoreboardIndex(): void {
        this.selectedIndex ++;
        if (this.selectedIndex >= this.scoreboardHistory.length) {
            this.selectedIndex = this.scoreboardHistory.length - 1;
        }
    }

    subScoreboardIndex(): void {
        this.selectedIndex --;
        if (this.selectedIndex < 0) {
            this.selectedIndex = 0;
        }
    }
}
