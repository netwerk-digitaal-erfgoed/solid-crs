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

  handleIncomingRedirect(): Observable<any> {
    this.logger.debug(SolidMockService.name, 'Trying to retrieve session');
    return of({ isLoggedIn: true });
  }

  login(): Observable<any> {
    this.logger.debug(SolidMockService.name, 'Loggin in user');
    return of(true);
  }

  logout(): Observable<any> {
    this.logger.debug(SolidMockService.name, 'Logging out user');
    return of(true);
  }

}
