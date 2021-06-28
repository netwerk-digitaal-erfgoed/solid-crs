import { ArgumentError } from '../errors/argument-error';
import { Term } from './term';
import { TermSource } from './term-source';

export class TermService {

  constructor(private endpoint: string) {

    // check if endpoint is valid url
    try {

      new URL(this.endpoint);

    } catch (error) {

      throw new ArgumentError('Argument endpoint is an invalid URL.', this.endpoint, error);

    }

  }

  /**
   * Queries the GraphQL endpoint for Terms matching given query and sources
   *
   * @param query The query string
   * @param sources The sources on which the term might be present
   * @returns A list of matching Terms
   */
  async query(query: string, sources: string[]): Promise<Term[]> {

    if (!query) {

      throw new ArgumentError('Argument query should be set.', query);

    }

    if (!sources || sources.length < 1) {

      throw new ArgumentError('Argument sources should be set.', sources);

    }

    const graphQlQuery =
    `query Terms ($sources: [ID]!, $query: String!) {
      terms (sources: $sources query: $query) {
        source {
          name
          uri
        }
        terms {
          uri
          name: prefLabel
          alternateName: altLabel
          hiddenName: hiddenLabel
          description: scopeNote
          broader {
            uri
            name: prefLabel
          }
          narrower {
            uri
            name: prefLabel
          }
        }
      }
    }`;

    const body = {
      query: graphQlQuery,
      variables: {
        sources,
        query,
      },
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    const result = await fetch(this.endpoint, { headers, body: JSON.stringify(body), method: 'POST' }).catch(
      (err) => {

        throw new ArgumentError('Error while querying endpoint.', { url: this.endpoint, headers, body }, err);

      }
    ).then(
      async(response): Promise<GraphQlResult> => await response.json()
    );

    // parse and return query result
    return [].concat(...result.data.terms.map(
      (termList) => termList.terms
    ));

  }

  /**
   * Queries the GraphQL endpoint for sources
   *
   * @returns A list of source URIs
   */
  async getSources(): Promise<TermSource[]> {

    const body = {
      query: 'query Sources { sources { name alternateName uri creators { uri alternateName } } }',
      variables: { },
    };

    const headers = {
      'Content-Type': 'application/json',
    };

    const result = await fetch(this.endpoint, { headers, body: JSON.stringify(body), method: 'POST' }).catch(
      (err) => {

        throw new ArgumentError('Error while querying endpoint.', { url: this.endpoint, headers, body }, err);

      }
    ).then(
      async(response): Promise<GraphQlResult> => await response.json()
    );

    return result.data.sources;

  }

}

/**
 * Helper type for the response body of the term network
 */
interface GraphQlResult {
  data: {
    terms?: [
      {
        source: Partial<TermSource>;
        terms: Term[];
      },
    ];
    sources?: TermSource[];
  };
}
