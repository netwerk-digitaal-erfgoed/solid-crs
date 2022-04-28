import { Collection, CollectionObject } from '@netwerk-digitaal-erfgoed/solid-crs-core';

export const mockObject1: CollectionObject = {
  image: 'test-uri',
  uri: 'object-uri-1',
  name: 'Object 1',
  description: 'This is object 1',
  updated: '0',
  collection: 'collection-uri-1',
  type: 'http://schema.org/Photograph',
  additionalType: [ { 'name':'bidprentjes', 'uri':'https://data.cultureelerfgoed.nl/term/id/cht/1e0adea5-71fa-4197-ad73-90b706d2357c' } ],
  identifier: 'SK-A-1115',
  maintainer: 'https://data.hetlageland.org/',
  creator: [ { 'name':'Jan Willem Pieneman', 'uri':'http://www.wikidata.org/entity/Q512948' } ],
  locationCreated: [ { 'name':'Delft', 'uri':'http://www.wikidata.org/entity/Q33432813' } ],
  material: [ { 'name':'olieverf', 'uri':'http://vocab.getty.edu/aat/300015050' } ],
  dateCreated: '1824-07-24',
  subject: [ { 'name':'veldslagen', 'uri':'http://vocab.getty.edu/aat/300185692' } ],
  location: [ { 'name':'Waterloo', 'uri':'http://www.wikidata.org/entity/Q31579578' } ],
  person: [ { 'name':'Arthur Wellesley of Wellington', 'uri':'http://data.bibliotheken.nl/id/thes/p067531180' } ],
  event: [ { 'name':'Slag bij Waterloo', 'uri':'http://www.wikidata.org/entity/Q48314' } ],
  organization: [ { 'name':'Slag bij Waterloo', 'uri':'http://www.wikidata.org/entity/Q48314' } ],
  height: 52,
  width: 82,
  depth: 2,
  weight: 120,
  heightUnit: 'CMT',
  widthUnit: 'CMT',
  depthUnit: 'CMT',
  weightUnit: 'KGM',
  mainEntityOfPage: 'http://localhost:3000/hetlageland/heritage-objects/data-1#object-1-digital',
  license: 'https://creativecommons.org/publicdomain/zero/1.0/deed.nl',
};

export const mockObject2: CollectionObject = {
  ...mockObject1,
  height: undefined,
  weight: undefined,
  depth: undefined,
  width: undefined,
};

export const mockObjectMinimal: CollectionObject = {
  type: 'type',
  name: 'name',
  uri: 'object-uri-minimal',
  collection: 'collection-uri-1',
  description: 'description',
  image: 'http://image.uri',
};

export const mockObjectEmpty: CollectionObject = {
  additionalType: [],
  creator: [],
  locationCreated: [],
  material: [],
  subject: [],
  location: [],
  person: [],
  event: [],
  organization: [],
} as any;

export const mockCollection1: Collection = {
  uri: 'colleciton-uri-1',
  name: 'Collection 1',
  description: 'This is collection 1',
  objectsUri: null,
  distribution: null,
};

export const mockCollection2: Collection = {
  uri: 'collection-uri-2',
  name: 'Collection 2',
  description: 'This is collection 2',
  objectsUri: null,
  distribution: null,
};
