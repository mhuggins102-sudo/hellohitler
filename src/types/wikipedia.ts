export interface WikiParseResponse {
  parse: {
    title: string;
    pageid: number;
    displaytitle: string;
    text: {
      '*': string;
    };
    links: Array<{
      ns: number;
      '*': string;
      exists?: string;
    }>;
    redirects?: Array<{
      from: string;
      to: string;
    }>;
  };
}

export interface WikiRandomResponse {
  query: {
    random: Array<{
      id: number;
      ns: number;
      title: string;
    }>;
  };
}

export interface WikiSearchResponse {
  query: {
    search: Array<{
      ns: number;
      title: string;
      pageid: number;
      snippet: string;
      size: number;
      wordcount: number;
    }>;
  };
}
