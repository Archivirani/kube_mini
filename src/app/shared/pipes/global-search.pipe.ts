import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'globalSearch' })
export class GlobalSearchFilter implements PipeTransform {
    private valueMappings: { [key: string]: string } = {
      true: 'active',
      false: 'not-active',
      'True': 'active',
      'False': 'not-active',
      1: 'active',
      0: 'not-active',
    };

    transform(items: any[], query: string, fieldNames: string[]): any[] {
        if (!items || !query || !fieldNames) {
            return items;
        }

        const lowerCaseQuery = query.toLowerCase();

        return items.filter(item => {
            return fieldNames.some(fieldName => {
                const fieldValue = this.getFieldValue(item, fieldName);
                if (fieldValue !== null && fieldValue !== undefined) {
                    const valueString = fieldValue.toString().toLowerCase();
                    if (fieldName.toLowerCase() === 'active' || fieldName.toLowerCase() === 'isactive') {
                      const mappedValue = this.valueMappings[valueString];
                      if (mappedValue) {
                          return mappedValue.toLowerCase().includes(lowerCaseQuery);
                      }
                  }
                    return valueString.includes(lowerCaseQuery);
                }
                return false;
            });
        });
    }

    private getFieldValue(item: any, fieldName: string): any {
        const fields = fieldName.split('.');
        let value = item;
    
        for (const field of fields) {
            if (value === null || value === undefined) {
                return null;
            }
            if (Array.isArray(value)) {
                // Find the item in the array that matches
                value = value.map(v => this.getFieldValue(v, field));
                if (value.length === 1) {
                    value = value[0];
                } else {
                    return value.filter(v => v !== null && v !== undefined);
                }
            } else if (value[field] !== undefined) {
                value = value[field];
            } else {
                return null;
            }
        }
    
        return value;
    }
    
}