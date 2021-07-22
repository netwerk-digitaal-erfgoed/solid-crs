import fetchMock, { enableFetchMocks } from 'jest-fetch-mock';
import { TermSource } from './term-source';
import { TermService } from './term.service';
enableFetchMocks();

describe('TermService', () => {

  let service: TermService;

  beforeEach(async() => {

    fetchMock.resetMocks();

    service = new TermService('https://endpoint.url/');

  });

  it('should instantiate', () => {

    expect(service).toBeTruthy();

  });

  it('should not instantiate with invalid URL', () => {

    expect(() => new TermService('test')).toThrow('Argument endpoint is an invalid URL.');

  });

  describe('query()', () => {

    const queryString = 'test query';

    const sources: string[] = [ 'https://source.url/' ];

    const queryResult = {
      'data':{
        'terms':[
          {
            'source':{
              'name':'Cultuurhistorische Thesaurus',
              'uri':'https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
            },
            'terms':[
              {
                'uri':'https://data.cultureelerfgoed.nl/term/id/cht/ca4ec020-c0c1-48a2-baae-08eb0538c804',
                'name':[
                  'devotieprenten',
                ],
                'alternateName':[
                  'devotieprent',
                ],
                'hiddenName':[
                  'hidden-devotieprent',
                ],
                'description':[
                  'Algemene benaming voor een houtsnede of gravure, al dan niet ingekleurd, of een gedrukte voorstelling van Christus, Maria, een heilige, een devotie(beeld) of een bijbelse voorstelling op een klein formaat perkament of papier. Veelal voorzien van een begeleidende tekst. (Religieus Erfgoedthesaurus)',
                ],
                'broader':[
                  {
                    'uri':'https://data.cultureelerfgoed.nl/term/id/cht/26b0d61a-e37a-4912-b516-48884f251bc6',
                    'name':[
                      'prenten',
                    ],
                  },
                ],
                'narrower':[
                  {
                    'uri':'https://data.cultureelerfgoed.nl/term/id/cht/0668b101-8ec0-4d39-8f9b-f0e43a0a779d',
                    'name':[
                      'bedevaartprenten',
                    ],
                  },
                  {
                    'uri':'https://data.cultureelerfgoed.nl/term/id/cht/0a117884-0cc2-4ee0-a223-8f6ce1fa8e67',
                    'name':[
                      'heiligenprenten',
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
    };

    it.each([ null, undefined ])('should error when query is %s', async (value) => {

      await expect(service.query(value, sources)).rejects.toThrow('Argument query should be set');

    });

    it.each([ null, undefined ])('should error when query is %s', async (value) => {

      await expect(service.query(queryString, value)).rejects.toThrow('Argument sources should be set');

    });

    it('should throw error when request failed', async () => {

      fetchMock.mockRejectOnce();

      await expect(service.query(queryString, sources)).rejects.toThrow('Error while querying endpoint.');

    });

    it('should return correctly parsed list of terms when successful', async () => {

      fetchMock.mockResponseOnce(JSON.stringify(queryResult), { status: 200 });

      const result = await service.query(queryString, sources);

      expect(result).toBeTruthy();
      expect(result.length).toBeGreaterThan(0);
      expect(result[0]).toBeTruthy();
      expect(result[0].uri).toEqual(queryResult.data.terms[0].terms[0].uri);
      expect(result[0].name).toEqual(queryResult.data.terms[0].terms[0].name[0]);
      expect(result[0].description).toEqual(queryResult.data.terms[0].terms[0].description);
      expect(result[0].alternateName).toEqual(queryResult.data.terms[0].terms[0].alternateName);
      expect(result[0].hiddenName).toEqual(queryResult.data.terms[0].terms[0].hiddenName);
      expect(result[0].broader).toEqual(queryResult.data.terms[0].terms[0].broader);
      expect(result[0].narrower).toEqual(queryResult.data.terms[0].terms[0].narrower);

    });

  });

  describe('getSources()', () => {

    const queryResult = {
      'data':{
        'sources':[
          {
            'name':'Brinkman trefwoordenthesaurus',
            'alternateName':'Brinkman',
            'uri':'http://data.bibliotheken.nl/thes/brinkman/sparql',
            'creators':[
              {
                'uri':'http://data.bibliotheken.nl/doc/thes/p075301482',
                'alternateName':'KB',
              },
            ],
          },
          {
            'name':'Cultuurhistorische Thesaurus',
            'alternateName':'CHT',
            'uri':'https://data.cultureelerfgoed.nl/PoolParty/sparql/term/id/cht',
            'creators':[
              {
                'uri':'https://www.cultureelerfgoed.nl/',
                'alternateName':'RCE',
              },
            ],
          },
          {
            'name':'GTAA: onderwerpen',
            'alternateName': null,
            'uri':'https://data.netwerkdigitaalerfgoed.nl/beeldengeluid/gtaa-onderwerpen/sparql',
            'creators':[
              {
                'uri':'https://www.beeldengeluid.nl/',
                'alternateName':'Beeld en Geluid',
              },
            ],
          },
          {
            'name':'Nederlandse Thesaurus van Auteursnamen',
            'alternateName':'NTA',
            'uri':'http://data.bibliotheken.nl/thesp/sparql',
            'creators':[
              {
                'uri':'http://data.bibliotheken.nl/doc/thes/p075301482',
                'alternateName':'KB',
              },
            ],
          },
          {
            'name':'Thesaurus Tweede Wereldoorlog Nederland',
            'alternateName':'WO2 Thesaurus',
            'uri':'https://data.niod.nl/PoolParty/sparql/WO2_Thesaurus',
            'creators':[
              {
                'uri':'https://www.niod.nl/',
                'alternateName':'NIOD',
              },
            ],
          },
          {
            'name':'Wikidata: alle entiteiten',
            'alternateName': null,
            'uri':'https://query.wikidata.org/sparql#entities-all',
            'creators':[
              {
                'uri':'https://www.wikidata.org/entity/Q180',
                'alternateName':'Wikidata',
              },
            ],
          },
        ],
      },
    };

    it('should throw error when request failed', async () => {

      fetchMock.mockRejectOnce();

      await expect(service.getSources()).rejects.toThrow('Error while querying endpoint.');

    });

    it('should return correctly parsed list of sources', async () => {

      fetchMock.mockResponseOnce(JSON.stringify(queryResult), { status: 200 });

      const result = await service.getSources();

      expect(result).toContainEqual<TermSource>({
        uri: queryResult.data.sources[0].uri,
        name: queryResult.data.sources[0].name,
        alternateName: queryResult.data.sources[0].alternateName,
        creators: queryResult.data.sources[0].creators,
      });

    });

  });

});
