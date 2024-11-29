import { Injectable } from '@angular/core';
import { AvoidRouter } from '../shared/avoid-router';

@Injectable({
  providedIn: 'root'
})
export class AvoidRouterService {
  public isLoaded: boolean;

  constructor() {}

  load(): Promise<any> {

    const promise = AvoidRouter.load()
      .then(() => {
        this.isLoaded = true;
        return true;
      });

    return promise;
  }
}
