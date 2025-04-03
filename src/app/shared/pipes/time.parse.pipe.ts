import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'timeParse' })
export class TimeParsePipe implements PipeTransform {
  // transform(time: any): any {
  //   let hour = (time.split(':'))[0];
  //   let min = (time.split(':'))[1];
  //   let part = hour >= 12 ? 'PM' : 'AM';
  //   if (parseInt(hour) == 0)
  //     hour = 12;
  //   min = (min + '').length == 1 ? `0${min}` : min;
  //   hour = hour > 12 ? hour - 12 : hour;
  //   hour = (hour + '').length == 1 ? `0${hour}` : hour;
  //   return `${hour}:${min} ${part}`
  // }
  transform(time) {
    if (!time || typeof time !== 'string') return time; 
    const [hours, minutes] = time.split(':').map(part => parseInt(part, 10));
    if (isNaN(hours) || isNaN(minutes)) return time; 
    const formattedHours = String(hours % 24).padStart(2, '0'); 
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const period = hours >= 12 ? 'PM' : 'AM'; 
    return `${formattedHours}:${formattedMinutes} ${period}`;
}

}
