import { Pipe, PipeTransform } from '@angular/core';
import { FilterModel } from '@services/model/filter.model';

@Pipe({ name: 'filter' })
export class FilterPipe implements PipeTransform {
  transform(data: any[], filterConfig: FilterModel): any[] {
    const returnData: Array<any> = [];
    if (data && data.length && filterConfig.searchText) {
      filterConfig.searchText = filterConfig.searchText.toLowerCase();

      data.forEach((item) => {
        let isAdded = false;
        if (item && item.item) {
          const innerItems = [];
          item.item.forEach((element) => {
            let isAdded = false;
            if (element && element.patient) {
              Object.keys(element.patient).forEach((key) => {
                if (
                  !isAdded &&
                  element.patient[key] &&
                  filterConfig.fields.includes(key) &&
                  element.patient[key].toString().toLowerCase().indexOf(filterConfig.searchText) > -1
                ) {
                  innerItems.push(element)
                  returnData.push({ ...item, item: innerItems });
                  isAdded = true;
                }
              });
            }
          });
        }
        if (item && item.patient) {
          Object.keys(item.patient).forEach((key) => {
            if (
              !isAdded &&
              item.patient[key] &&
              filterConfig.fields.includes(key) &&
              item.patient[key].toString().toLowerCase().indexOf(filterConfig.searchText) > -1
            ) {
              returnData.push(item);
              isAdded = true;
            }
          });
        } else {
          Object.keys(item).forEach((key) => {
            if (
              !isAdded &&
              item[key] &&
              filterConfig.fields.includes(key) &&
              item[key].toString().toLowerCase().indexOf(filterConfig.searchText) > -1
            ) {
              returnData.push(item);
              isAdded = true;
            }
          });
        }
      });
    } else {
      return data;
    }

    return returnData;
  }
}
