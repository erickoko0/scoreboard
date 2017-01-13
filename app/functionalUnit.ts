
export class FunctionalUnit {
    timer: number = -1;
    insId: number = -1;
    name:   string;
    busy:   boolean = false;
    op?:    string;
    fi?:    string;
    fj?:    string;
    fk?:    string;
    qj?:    string;
    qk?:    string;
    rj?:    string;
    rk?:    string;
    constructor(name: string) {
        this.name = name;
    }
}
