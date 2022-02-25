import { ObjectUpdate } from './models/object-update.model';
import { ObjectEvent } from './object.events';
import { ObjectContext } from './object.machine';

export const loadNotifications = async(
  context: ObjectContext,
  event: ObjectEvent,
): Promise<ObjectUpdate[]> => {

  const anUpdateAsConstToNotAutoRemoveTheFunctionBlockOnSave: ObjectUpdate = {
    uri: 'https://uri.com',
    originalObject: 'https://pod.inrupt.com/arthur/heritage-objects/data-26802ad5-3c14-4f21-8ffc-373e36a3a327#object-48b7247b-2f2d-415a-a2f9-31459f572de7',
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
