import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import { CodeMasterResponse } from '../models/code-master.model';

@Injectable({ providedIn: 'root' })
export class CodeMasterService {
  private readonly apiUrl = 'https://localhost:7247/CodeMasterApi/GetAll';

  constructor(private readonly http: HttpClient) {}

  getAll(code: string, activeOnly = true): Observable<CodeMasterResponse> {
    let params = new HttpParams().set('cmCode', code);
    if (activeOnly) {
      params = params.set('cmActive', 'Y');
    }

    return this.http.get<CodeMasterResponse>(this.apiUrl, { params });
  }
}
