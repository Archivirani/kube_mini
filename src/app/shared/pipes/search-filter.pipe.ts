import { DatePipe } from '@angular/common';
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'searchFilter'
})
export class SearchFilterPipe implements PipeTransform {
  constructor(private datePipe: DatePipe) { }
  transform(items: any[], fields: any): any[] {
    if (!items || !fields) {
      return items;
    }
    if ((items && items.length) && Object.values(fields).every(value => value === '' || value === null || value === undefined)) {
      return items;
    } 
    let result = items;
    Object.keys(fields).forEach((key) => {
      if (!!fields[key]) {
        if (fields[key].type === 'Dropdown') {
        
          result = result.filter(d => d[key].toLowerCase() === fields[key].item.toLowerCase());
        } else if (fields[key] && typeof fields[key] === 'string' && key !== 'QuickSearch' && result.every && result.every(obj => obj.hasOwnProperty(key))) {
          result = result.filter(d => {
            var searchValue = this.prepareForComparison(fields[key]);
            const fieldValue = this.prepareForComparison(d[key]); 
            if (fields[key].includes(' ')){
                if (key == "firstName") {
                  const fullName = this.prepareForComparison((d['firstName'] + ' '+ d['familyName'])); 
                  return fullName.includes(searchValue); 
               }
               else { return fieldValue.includes(searchValue)}
            }
            else { return fieldValue.includes(searchValue)}
          });
        } else if (fields[key] && fields[key].length && typeof fields[key] !== 'string' && fields[key].every(item => item instanceof Date)) {
          result = result.filter(d => this.formatJsonDate(d[key]) >= this.formatDate(fields[key][0]) && this.formatJsonDate(d[key]) <= this.formatDate(fields[key][1]));
        } else if (fields[key] && fields[key] instanceof Date) {
 const searchDate = fields[key];
          result = result.filter((d) => {
            const fieldValue = new Date(d[key]);
            return fieldValue.getTime() === searchDate.getTime();
          });
        } else if (key === 'QuickSearch') {
          result = result.filter(element =>{
            for (const item in element) {
              if (element[item] instanceof Date) {
                if (this.datePipe.transform(element[item], 'MMM dd, yyyy').toLowerCase().includes(fields[key].toLowerCase())) {
                  return true;
                }
              } else if (typeof element[item] === 'string') {
                if (this.prepareForComparison(element[item]).includes(this.prepareForComparison(fields[key]))) {
                  return true;
                }
              }
            }
            return false;
          });
        }
      }
    });
    return result;
  }
 
  

  private prepareForComparison(value: any): string {
    if (value !== null && value !== undefined) {
      return String(value)?.replace(/\s/g, '').toLowerCase(); // Remove spaces and convert to lowercase
    }
    return '';
  }

  private formatDate(date: Date): string {
    if (date instanceof Date) {
      return this.datePipe.transform(date, 'yyyy-MM-dd')
    } else {
      return '';
    }
  }

  private formatJsonDate(date: string): string {
    if (date && date.includes('/Date(')) {
      const newFormateDate = date.replace('/Date(', '')?.replace(')/', '');
      const utcIsoString = `${new Date(+(newFormateDate)).toISOString().split("T")[0]}T00:00:00`;
      return this.datePipe.transform(utcIsoString, 'yyyy-MM-dd')
    } else {
      return '';
    }
  }
}

export class SearchPipe implements PipeTransform {
  public transform(value, keys: string, term: string) {
    if (!term) return value;
    return (value || []).filter((item) =>
      keys
        .split(',')
        .some(
          (key) =>
            item.hasOwnProperty(key) && new RegExp(term, 'gi').test(item[key])
        )
    );
  }
}
