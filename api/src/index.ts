import { mkdir } from "node:fs/promises";
import { createApp } from "./app";
import { uploadsDir } from "./uploads";

const port = Number(process.env.PORT ?? 3001);

await mkdir(uploadsDir(), { recursive: true });

const app = createApp();
app.listen(port, () => {
  console.log(`VentasFix API en :${port}`);
});
