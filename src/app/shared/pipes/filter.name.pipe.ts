import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'filterName' })
export class FilterNamePipe implements PipeTransform {
  transform(value: any[], args: string): any[] {
    const returnData = [];
    if (value && value instanceof Array && value.length && args) {
      args = args.toLowerCase();
      value.forEach((item) => {
        if (item.name && item.name.toString().toLowerCase().indexOf(args) > -1 || item.barcode && item.barcode.toString().toLowerCase().indexOf(args) > -1 ) {
          returnData.push(item);
        }
      });
    } else {
      return value;
    }
    return returnData;
  }
}
