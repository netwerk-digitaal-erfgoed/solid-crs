import { SolidSDKService } from '@digita-ai/inrupt-solid-service';
import { v5 } from 'uuid';
import { addStringNoLocale, addUrl, getSolidDataset, getThing, getUrl, overwriteFile, saveSolidDatasetAt, setThing } from '@digita-ai/inrupt-solid-client';

/**
 * Creates a Solid pod at https://pods.netwerkdigitaalerfgoed.nl/
 *
 * @param context The authorization context
 * @param event The authorization event type
 * @returns The WebID of the pod
 */
export const createPod = async (solidService: SolidSDKService): Promise<string> => {

  const session = solidService.getDefaultSession();

  if (!session?.info?.webId) {

    throw Error('Not logged in');

  }

  const createPodRequest = async (webId: string) => await fetch(
    `${process.env.VITE_PODS_URI}idp/register/`,
    {
      method: 'post',
      headers: {
        'content-type': 'application/json',
        accept: 'application/json',
      },
      body: JSON.stringify({
        webId,
        createPod: 'on',
        podName: v5(webId, 'a2e08b56-67b9-49b9-894f-696052dbef9a'),
      }),
    }
  );

  // retrieve quad
  const oidcIssuerRegistrationToken = await createPodRequest(session.info.webId)
    .then(async (res) => {

      if (res.status === 400) {

        return (await res.json()).details.quad.split('<http://www.w3.org/ns/solid/terms#oidcIssuerRegistrationToken>')[1].replace(/[^\w\d-]*/ig, '');

      } else {

        throw new Error('Server returned error (first request)');

      }

    });

  // add missing oidcRegistration quad
  let dataset = await getSolidDataset(session.info.webId, { fetch: session.fetch });
  let profileThing = getThing(dataset, session.info.webId);

  if (!profileThing) {

    throw Error(`Could not retrieve profile for ${session.info.webId}`);

  }

  profileThing = addStringNoLocale(profileThing, 'http://www.w3.org/ns/solid/terms#oidcIssuerRegistrationToken', oidcIssuerRegistrationToken);
  dataset = setThing(dataset, profileThing);
  await saveSolidDatasetAt(session.info.webId, dataset, { fetch: session.fetch });

  // create pod, return baseUrl
  const podBaseUrl = await createPodRequest(session.info.webId).then(async (res) => {

    if (!res.ok) {

      throw Error('Server returned error (second request)');

    } else {

      return (await res.json()).podBaseUrl;

    }

  });

  // add storage triple + default type indexes to pod
  dataset = await getSolidDataset(session.info.webId, { fetch: session.fetch });
  profileThing = getThing(dataset, session.info.webId);

  if (!profileThing) {

    throw Error(`Could not retrieve profile for ${session.info.webId}`);

  }

  const privateTypeIndex = getUrl(profileThing, 'http://www.w3.org/ns/solid/terms#privateTypeIndex');

  if (!privateTypeIndex) {

    await session.fetch(`${podBaseUrl}settings/privateTypeIndex`, { method: 'head' }).then(async (res) => {

      if (res.status === 404) {

        await overwriteFile(`${podBaseUrl}settings/privateTypeIndex`, new Blob([
          `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
<>
 a solid:TypeIndex ;
 a solid:UnlistedDocument.`,
        ], { type: 'text/turtle' }), { fetch: session.fetch });

      }

    });

    profileThing = addUrl(profileThing, 'http://www.w3.org/ns/solid/terms#privateTypeIndex', `${podBaseUrl}settings/privateTypeIndex`);

  }

  const publicTypeIndex = getUrl(profileThing, 'http://www.w3.org/ns/solid/terms#publicTypeIndex');

  if (!publicTypeIndex) {

    await session.fetch(`${podBaseUrl}settings/publicTypeIndex`, { method: 'head' }).then(async (res) => {

      if (res.status === 404) {

        await overwriteFile(`${podBaseUrl}settings/publicTypeIndex`, new Blob([
          `@prefix solid: <http://www.w3.org/ns/solid/terms#>.
<>
 a solid:TypeIndex ;
 a solid:ListedDocument.`,
        ], { type: 'text/turtle' }), { fetch: session.fetch });

      }

    });

    profileThing = addUrl(profileThing, 'http://www.w3.org/ns/solid/terms#publicTypeIndex', `${podBaseUrl}settings/publicTypeIndex`);

  }

  profileThing = addUrl(profileThing, 'http://www.w3.org/ns/pim/space#storage', podBaseUrl);
  // todo add default type index files
  dataset = setThing(dataset, profileThing);
  await saveSolidDatasetAt(session.info.webId, dataset, { fetch: session.fetch });

  return session.info.webId;

};
