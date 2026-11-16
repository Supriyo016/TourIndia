/**
 * A minimal in-memory stand-in for the MongoDB calls this app makes. It lets the
 * real route handlers run without a database server. It does not verify MongoDB
 * itself; set TEST_MONGODB_URI to run the same tests against a real instance.
 */
type Doc = Record<string, unknown> & { _id?: unknown };

let nextId = 1;

function matches(doc: Doc, filter: Doc) {
  return Object.entries(filter).every(([key, value]) => doc[key] === value);
}

function applyUpdate(doc: Doc, update: Record<string, Doc>, inserted: boolean) {
  if (inserted && update.$setOnInsert) Object.assign(doc, update.$setOnInsert);
  if (update.$set) Object.assign(doc, update.$set);
  for (const [key, amount] of Object.entries(update.$inc ?? {})) doc[key] = (Number(doc[key]) || 0) + Number(amount);
}

class FakeCollection {
  docs: Doc[] = [];

  async insertOne(doc: Doc) {
    this.docs.push({ _id: `id-${nextId++}`, ...doc });
    return { acknowledged: true };
  }

  private upsert(filter: Doc, update: Record<string, Doc>, upsert?: boolean) {
    let doc = this.docs.find((item) => matches(item, filter));
    const inserted = !doc && Boolean(upsert);
    if (inserted) {
      doc = { ...filter };
      this.docs.push(doc);
    }
    if (doc) applyUpdate(doc, update, inserted);
    return doc ?? null;
  }

  async updateOne(filter: Doc, update: Record<string, Doc>, options?: { upsert?: boolean }) {
    this.upsert(filter, update, options?.upsert);
    return { acknowledged: true };
  }

  async findOneAndUpdate(filter: Doc, update: Record<string, Doc>, options?: { upsert?: boolean }) {
    return this.upsert(filter, update, options?.upsert);
  }

  find(filter: Doc = {}, options?: { projection?: Record<string, number> }) {
    const rows = this.docs.filter((doc) => matches(doc, filter));
    const projected = rows.map((doc) => {
      if (!options?.projection) return { ...doc };
      const keep = new Set(["_id", ...Object.keys(options.projection)]);
      return Object.fromEntries(Object.entries(doc).filter(([key]) => keep.has(key)));
    });
    const cursor = {
      sort: () => cursor,
      limit: () => cursor,
      toArray: async () => projected,
    };
    return cursor;
  }

  async countDocuments() {
    return this.docs.length;
  }

  async deleteMany() {
    this.docs = [];
    return { acknowledged: true };
  }

  async createIndex() {
    return "ok";
  }
}

const collections = new Map<string, FakeCollection>();

export const fakeDb = {
  collection(name: string) {
    if (!collections.has(name)) collections.set(name, new FakeCollection());
    return collections.get(name)!;
  },
};
