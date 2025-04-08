import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingMap = new Map<string, BehaviorSubject<boolean>>();
  private globalLoading = new BehaviorSubject<boolean>(false);

  loading$ = this.globalLoading.asObservable();

  getLoading(key: string) {
    if (!this.loadingMap.has(key)) {
      this.loadingMap.set(key, new BehaviorSubject<boolean>(false));
    }
    return this.loadingMap.get(key)!.asObservable();
  }

  setLoading(key: string, loading: boolean) {
    if (!this.loadingMap.has(key)) {
      this.loadingMap.set(key, new BehaviorSubject<boolean>(false));
    }
    this.loadingMap.get(key)!.next(loading);
  }

  show() {
    this.globalLoading.next(true);
  }

  hide() {
    this.globalLoading.next(false);
  }
}
