import { Observable, of } from 'rxjs';
import { Logger } from '../logging/logger';
import { SolidService } from './solid.service';

export class SolidMockService extends SolidService {

  constructor(private logger: Logger) {
    super();
  }

  validateWebId(webId: string): Observable<boolean> {
    this.logger.debug(SolidMockService.name, 'Validating WebID', webId);
    return of(true);
  }
  getIssuer(webId: string): Observable<string> {
    this.logger.debug(SolidMockService.name, 'Retrieving issuer', webId);
    return of('issuer');
  }

}
