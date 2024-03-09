declare module "weaviate-ts-client" {
  export class client {
    constructor(config: { scheme: string; host: string });
    data: {
      create: (args: any) => Promise<any>;
    };
    graphql: any;
  }
}
