import { Extractor } from "./extractor"
import { Transformer } from "./transformer"
import { Loader } from "./loader"

export class Runner {
  extractor: Extractor
  transformer: Transformer
  loader: Loader

  constructor(extractor: Extractor, transformer: Transformer, loader: Loader) {
    this.extractor = extractor
    this.transformer = transformer
    this.loader = loader
  }

  public init() {
    this.loader.open()
  }

  public async run() {
    try {
      console.log("---- INITIALIZING RUNNER ----")
      this.init()

      console.log("---- FETCHING LISTINGS ----")
      const results = await this.extractor.extract()

      console.log("---- TRANSFORMING LISTINGS ----")
      const rows = this.transformer.mapAll(results)

      console.log("---- LOADING NEW LISTINGS INTO DATABASE ----")
      await this.loader.load(rows)
    } finally {
      console.log("---- SHUTTING DOWN RUNNER ----")
      await this.shutdown()
    }
  }

  public async shutdown() {
    await this.loader.close()
  }
}
