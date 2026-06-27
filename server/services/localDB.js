import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'server', 'data');

// Ensure database directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

class LocalCollection {
  constructor(name) {
    this.name = name;
    this.filePath = path.join(DATA_DIR, `${name}.json`);
    if (!fs.existsSync(this.filePath)) {
      fs.writeFileSync(this.filePath, JSON.stringify([]));
    }
  }

  async read() {
    try {
      const data = await fs.promises.readFile(this.filePath, 'utf-8');
      return JSON.parse(data || '[]');
    } catch (e) {
      return [];
    }
  }

  async write(data) {
    await fs.promises.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }

  async find(query = {}) {
    const items = await this.read();
    return items.filter(item => this._matches(item, query));
  }

  async findOne(query = {}) {
    const items = await this.read();
    return items.find(item => this._matches(item, query)) || null;
  }

  async findById(id) {
    const items = await this.read();
    return items.find(item => item._id === id) || null;
  }

  async create(data) {
    const items = await this.read();
    const newItem = {
      _id: Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data
    };
    items.push(newItem);
    await this.write(items);
    return newItem;
  }

  async findByIdAndUpdate(id, update, options = {}) {
    const items = await this.read();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    
    let updatedItem = { ...items[index] };
    
    // Support MongoDB style updates (like $set or plain object updates)
    if (update.$set) {
      updatedItem = { ...updatedItem, ...update.$set };
    } else {
      updatedItem = { ...updatedItem, ...update };
    }
    
    updatedItem.updatedAt = new Date().toISOString();
    items[index] = updatedItem;
    await this.write(items);
    return updatedItem;
  }

  async findByIdAndDelete(id) {
    const items = await this.read();
    const index = items.findIndex(item => item._id === id);
    if (index === -1) return null;
    const deleted = items.splice(index, 1);
    await this.write(items);
    return deleted[0];
  }

  async countDocuments(query = {}) {
    const items = await this.find(query);
    return items.length;
  }

  _matches(item, query) {
    for (const key in query) {
      const queryVal = query[key];
      const itemVal = item[key];

      if (queryVal && typeof queryVal === 'object' && !Array.isArray(queryVal)) {
        if ('$ne' in queryVal) {
          if (itemVal === queryVal.$ne) return false;
        } else if ('$in' in queryVal) {
          if (!Array.isArray(queryVal.$in) || !queryVal.$in.includes(itemVal)) return false;
        } else if ('$nin' in queryVal) {
          if (Array.isArray(queryVal.$nin) && queryVal.$nin.includes(itemVal)) return false;
        } else if ('$gte' in queryVal) {
          if (itemVal < queryVal.$gte) return false;
        } else if ('$lte' in queryVal) {
          if (itemVal > queryVal.$lte) return false;
        } else if ('$gt' in queryVal) {
          if (itemVal <= queryVal.$gt) return false;
        } else if ('$lt' in queryVal) {
          if (itemVal >= queryVal.$lt) return false;
        } else {
          if (JSON.stringify(itemVal) !== JSON.stringify(queryVal)) return false;
        }
      } else {
        if (itemVal !== queryVal) return false;
      }
    }
    return true;
  }
}

export const localDB = {
  users: new LocalCollection('users'),
  couples: new LocalCollection('couples'),
  memories: new LocalCollection('memories'),
  letters: new LocalCollection('letters'),
  journals: new LocalCollection('journals'),
  activities: new LocalCollection('activities')
};
