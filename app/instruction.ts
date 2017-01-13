
export class Instruction {
    id:         number;
    name:       string;
    i:          string;
    j:          string;
    k:          string;
    state:      number = 0;
    issue?:     number;
    readOperands?: number;
    executionComplete?: number;
    writeResult?: number;
    functionalUnitIndex?: number = -1;
    constructor( id: number, name: string, i: string, j: string, k: string) {
        this.id = id;
        this.name = name;
        this.i = i;
        this.j = j;
        this.k = k;
    }
}
