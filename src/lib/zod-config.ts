import { z } from "zod";

// Zod probes for eval support with Function(""), which the Content-Security-Policy blocks; jitless skips the probe.
z.config({ jitless: true });
