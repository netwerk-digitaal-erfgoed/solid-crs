import { ObjectUpdate } from './models/object-update.model';
import { ObjectEvent } from './object.events';
import { ObjectContext } from './object.machine';

export const loadNotifications = async(
  context: ObjectContext,
  event: ObjectEvent,
): Promise<ObjectUpdate[]> => {

  const anUpdateAsConstToNotAutoRemoveTheFunctionBlockOnSave: ObjectUpdate = {
    uri: 'https://uri.com',
    originalObject: 'http://localhost:3000/44964450-4057-57aa-8492-f998707d4d2f/heritage-objects/data-bf03e6ac-309d-43cf-8988-7cb6e76f740d#object-64f2c5fa-7fc1-4b3f-8b11-0fb42f033cb7',
    updatedObject: 'https://updated.object',
    from: 'https://from.uri',
    to: 'https://to.uri',
  };

  return [
    anUpdateAsConstToNotAutoRemoveTheFunctionBlockOnSave,
    anUpdateAsConstToNotAutoRemoveTheFunctionBlockOnSave,
    anUpdateAsConstToNotAutoRemoveTheFunctionBlockOnSave,
    anUpdateAsConstToNotAutoRemoveTheFunctionBlockOnSave,
  ];

};
