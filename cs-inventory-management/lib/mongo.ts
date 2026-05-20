import { MongoClient, type Db, type Document } from "mongodb";
import { promises as fs } from "fs";
import path from "path";
import { hashPassword } from "./auth";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

const uri = process.env.MONGODB_URI || "";
const client = uri ? new MongoClient(uri) : null;

function getClientPromise() {
  if (!client) return undefined;
  const clientPromise = global._mongoClientPromise || client.connect();
  if (process.env.NODE_ENV !== "production") global._mongoClientPromise = clientPromise;
  return clientPromise;
}

const localDbDir = path.resolve(process.cwd(), ".local-db");
const localDbFile = path.join(localDbDir, "db.json");

const defaultLocalData = {
  users: [
    {
      _id: "default-admin",
      name: "Admin User",
      email: "admin@example.com",
      passwordHash: hashPassword("Password123!"),
      role: "admin",
      createdAt: new Date().toISOString(),
    },
  ],
  items: [],
  transactions: [],
};

async function ensureLocalDbFile() {
  try {
    await fs.mkdir(localDbDir, { recursive: true });
    await fs.access(localDbFile);
  } catch {
    await fs.writeFile(localDbFile, JSON.stringify(defaultLocalData, null, 2), "utf8");
  }
}

async function readLocalData() {
  await ensureLocalDbFile();
  const raw = await fs.readFile(localDbFile, "utf8");
  return JSON.parse(raw) as Record<string, unknown[]>;
}

async function writeLocalData(data: Record<string, unknown[]>) {
  await fs.writeFile(localDbFile, JSON.stringify(data, null, 2), "utf8");
}

function matches(query: Record<string, unknown>, item: Record<string, unknown>) {
  return Object.entries(query).every(([key, value]) => {
    if (key === "_id") {
      return String(item._id) === String(value);
    }
    if (typeof value === "object" && value !== null) {
      const typed = value as Record<string, unknown>;
      if (typed.$in && Array.isArray(typed.$in)) {
        return typed.$in.some((option) => option === item[key]);
      }
    }
    return item[key] === value;
  });
}

function createLocalCursor(name: string, query: Record<string, unknown> = {}) {
  let sortObj: Record<string, number> | null = null;

  const resolve = async () => {
    const data = await readLocalData();
    const items = (data[name] || []) as Record<string, unknown>[];
    const results = query && Object.keys(query).length ? items.filter((item) => matches(query, item)) : items;

    if (!sortObj) return results;

    return [...results].sort((a, b) => {
      const [[key, direction]] = Object.entries(sortObj || {});
      const aValue = a[key] as number | string | Date | undefined;
      const bValue = b[key] as number | string | Date | undefined;
      if (aValue === bValue) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      const aComparable = aValue instanceof Date ? aValue.getTime() : aValue;
      const bComparable = bValue instanceof Date ? bValue.getTime() : bValue;

      if (typeof aComparable === "string" && typeof bComparable === "string") {
        return direction === 1 ? aComparable.localeCompare(bComparable) : bComparable.localeCompare(aComparable);
      }

      return direction === 1 ? Number(aComparable) - Number(bComparable) : Number(bComparable) - Number(aComparable);
    });
  };

  return {
    sort(nextSortObj: Record<string, number>) {
      sortObj = nextSortObj;
      return this;
    },
    async toArray() {
      return resolve();
    },
  };
}

function createLocalCollection(name: string) {
  return {
    find(query: Record<string, unknown> = {}) {
      return createLocalCursor(name, query);
    },
    async findOne(query: Record<string, unknown>) {
      const data = await readLocalData();
      const items = (data[name] || []) as Record<string, unknown>[];
      return items.find((item) => matches(query, item)) ?? null;
    },
    async insertOne(document: Record<string, unknown>) {
      const data = await readLocalData();
      const items = (data[name] || []) as Array<Record<string, unknown>>;
      const id = document._id ? String(document._id) : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      const docWithId = { ...document, _id: id };
      items.push(docWithId);
      data[name] = items;
      await writeLocalData(data);
      return { insertedId: id };
    },
    async updateOne(filter: Record<string, unknown>, update: Record<string, unknown>) {
      const data = await readLocalData();
      const items = (data[name] || []) as Array<Record<string, unknown>>;
      let modifiedCount = 0;
      const updatedItems = items.map((item) => {
        if (matches(filter, item)) {
          modifiedCount += 1;
          const setFields = (update.$set || {}) as Record<string, unknown>;
          return { ...item, ...setFields };
        }
        return item;
      });
      data[name] = updatedItems;
      await writeLocalData(data);
      return { modifiedCount };
    },
    async deleteOne(filter: Record<string, unknown>) {
      const data = await readLocalData();
      const items = (data[name] || []) as Array<Record<string, unknown>>;
      const nextItems = items.filter((item) => !matches(filter, item));
      data[name] = nextItems;
      await writeLocalData(data);
      return { deletedCount: items.length - nextItems.length };
    },
  };
}

async function createLocalDb() {
  await ensureLocalDbFile();
  return {
    collection(name: string) {
      return createLocalCollection(name);
    },
  };
}

export default async function connect() {
  const clientPromise = getClientPromise();
  if (clientPromise) {
    try {
      const client = await clientPromise;
      return client.db("cs_inventory_management");
    } catch (error) {
      console.warn("MongoDB connection failed, falling back to local JSON DB:", error);
      return createLocalDb();
    }
  }

  console.warn("MONGODB_URI is not configured; using local JSON DB fallback.");
  return createLocalDb();
}
