import { DatePipe } from '@angular/common';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject, Subscription } from 'rxjs';
import { ApiResponse, StatusFlags, eMessageIcon, eMessageType } from './model/data.service.model';
import { Options } from './model/option.model';

@Injectable({ providedIn: 'root' })
export class DataService {
  notify: Subject<Options> = new Subject();
  dataService: Subject<boolean> = new Subject();
  constructor(public http: HttpClient) { }

  get<T>(url: string, data?: string): Promise<ApiResponse<T>> {
    return new Promise<ApiResponse<T>>((resolve) => {
      var getSubscription: Subscription = this.http
        .get<ApiResponse<T>>(data ? `${url}/${data}` : url)
        .subscribe(
          (resp) => resolve(this.completeResponse(resp)),
          (error) => this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error }),
          () => getSubscription.unsubscribe()
        );
    });
  }

  getData<T>(url: string, data?: string): Promise<T> {
    return new Promise<T>(async (resolve) => {
      resolve((await this.get<T>(url, data)).data);
    });
  }

  post<T>(url: string, data: any, show?: boolean): Promise<ApiResponse<T>> {
    return new Promise<ApiResponse<T>>((resolve) => {
      var postSubscription: Subscription = this.http
        .post<ApiResponse<T>>(url, data)
        .subscribe(
          (resp) => {
            if (!show) {
              return resolve(this.completeResponse(resp))
            }
            else {
              return resolve(resp)
            }
          },
          (error) => {
            this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error })
          },
          () => postSubscription.unsubscribe()
        );
    });
  }

  put<T>(url: string, data: any, show?: boolean): Promise<ApiResponse<T>> {
    return new Promise<ApiResponse<T>>((resolve) => {
      var postSubscription: Subscription = this.http
        .put<ApiResponse<T>>(url, data)
        .subscribe(
          (resp) => {
            if (!show) {
              return resolve(this.completeResponse(resp))
            }
            else {
              return resolve(resp)
            }
          },
          (error) => {
            this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error })
          },
          () => postSubscription.unsubscribe()
        );
    });
  }

  postData<T>(url: string, data?: any): Promise<T> {
    return new Promise<T>(async (resolve) => {
      resolve((await this.post<T>(url, data)).data);
    });
  }

  putData<T>(url: string, data?: any): Promise<T> {
    return new Promise<T>(async (resolve) => {
      resolve((await this.put<T>(url, data)).data);
    });
  }

  postFile<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return new Promise<ApiResponse<T>>((resolve) => {
      const formData: FormData = new FormData();
      if (data && data.files && data.files.length) { data.files.forEach((file) => formData.append('files', file)); }
      formData.append('data', JSON.stringify(data));

      var postFileSubscription: Subscription = this.http
        .post<ApiResponse<T>>(url, formData)
        .subscribe(
          (resp) => resolve(this.completeResponse<T>(resp)),
          (error) => this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error }),
          () => postFileSubscription.unsubscribe()
        );
    });
  }

  delete<T>(url: string, data: any): Promise<ApiResponse<T>> {
    return new Promise<ApiResponse<T>>((resolve) => {
      var deleteSubscription: Subscription = this.http
        .post<ApiResponse<T>>(`${url}/delete`, data)
        .subscribe(
          (resp) => resolve(this.completeResponse<T>(resp)),
          (error) => this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error }),
          () => deleteSubscription.unsubscribe()
        );
    });
  }

  deleteData<T>(url: string, data?: any): Promise<ApiResponse<T>> {
    return new Promise<ApiResponse<T>>((resolve) => {
      var deleteSubscription: Subscription = this.http
        .delete<ApiResponse<T>>(`${url}`, data)
        .subscribe(
          (resp) => resolve(this.completeResponse<T>(resp)),
          (error) => this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error }),
          () => deleteSubscription.unsubscribe()
        );
    });
  }

  downloadFile(url: string, data: any, fileName = ''): void {
    var downloadSubscription: Subscription = this.http
      .post(url, data, { responseType: 'blob', observe: 'response' })
      .subscribe(
        (resp: HttpResponse<any>) => {
          const link = document.createElement('a');
          link.href = window.URL.createObjectURL(resp.body);
          link.download = fileName ? fileName : new DatePipe('en-US').transform(new Date(), 'ddMMyyyyHHmmss');
          link.click();
        },
        (error) => this.notify.next({ key: eMessageType.Error, value: error, icon: eMessageIcon.Error }),
        () => downloadSubscription.unsubscribe()
      );
  }

  completeResponse<T>(apiResponse: any): ApiResponse<T> {
    if (apiResponse && apiResponse.message) {
      switch (apiResponse.status) {
        // Success
        case StatusFlags.Success: {
          this.notify.next({ key: eMessageType.Success, value: apiResponse.message, icon: eMessageIcon.Success });
          break;
        }
        // Exceptions
        case StatusFlags.Failed: {
          this.notify.next({ key: eMessageType.Error, value: apiResponse.message, icon: eMessageIcon.Error });
          break;
        }
        // Warnings
        case StatusFlags.AlreadyExists:
        case StatusFlags.DependencyExists: {
          this.notify.next({ key: eMessageType.Warning, value: apiResponse.message, icon: eMessageIcon.Warning });
          break;
        }
        // Information
        default: {
          this.notify.next({ key: eMessageType.Info, value: apiResponse.message, icon: eMessageIcon.Info });
          break;
        }
      }
    }
    return apiResponse;
  }
}
