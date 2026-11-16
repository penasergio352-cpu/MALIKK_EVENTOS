import './config.js';
import { createApp } from './app.js';
import { createPool } from './db.js';

const port = Number(process.env.PORT ?? 3000);
const db = createPool();
const app = createApp(db);
const server = app.listen(port, () => {
  console.log(`API lista en http://localhost:${port}/api`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close(async () => {
      await db.end();
      process.exit(0);
    });
  });
}
