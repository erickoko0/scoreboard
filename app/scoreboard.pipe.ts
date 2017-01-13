import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'YesNo'})
export class YesNoPipe implements PipeTransform {
    transform(value: boolean): string {
        return value ? 'Yes' : 'No';
    }
}

@Pipe({name: 'Timer'})
export class TimerPipe implements PipeTransform {
    transform(value: number): string {
        return value === -1 ? '' : String(value);
    }
}

@Pipe({name: 'Qpipe', pure: false})
export class QPipe implements PipeTransform {
    transform(value: string, i: number, register: any): string {
        if (!value || value === '' || i == -1) {
            return '';
        }
        let register_index = Number(value.split('F')[1]);

        if ( !isNaN(register_index) && register[register_index / 2]['ins'] !== -1 && register[register_index / 2]['ins'] < i) {
            return register[register_index / 2]['reg'];
        }
        return '';
    }
}

@Pipe({name: 'Rpipe', pure: false})
export class RPipe implements PipeTransform {
    transform(value: string, reg: string): string {
        if (value) {
            return 'No';
        } else if(reg) {
            return 'Yes';
        } else {
            return '';
        }

    }
}
