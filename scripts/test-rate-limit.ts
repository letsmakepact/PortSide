import { checkRateLimit, getClientIp } from "../src/lib/rate-limit";
import assert from "node:assert";

console.log("=================================================");
console.log("Testing Rate Limiter & Sliding Window Defense");
console.log("=================================================\n");

let passed = 0;
let failed = 0;

function it(desc: string, fn: () => void) {
  try {
    fn();
    passed++;
    console.log(`  ✓ ${desc}`);
  } catch (err: any) {
    failed++;
    console.error(`  ✗ ${desc}`);
    console.error(`    ${err.message || err}`);
  }
}

it("allows requests under the rate limit threshold", () => {
  const key = "test-allow-key";
  for (let i = 0; i < 5; i++) {
    const res = checkRateLimit(key, 5, 1000);
    assert.strictEqual(res.allowed, true, `Request ${i + 1} should be allowed`);
  }
});

it("blocks requests exceeding the rate limit threshold with retryAfterSec", () => {
  const key = "test-block-key";
  for (let i = 0; i < 3; i++) {
    const res = checkRateLimit(key, 3, 1000);
    assert.strictEqual(res.allowed, true);
  }

  // 4th request should be blocked
  const blocked = checkRateLimit(key, 3, 1000);
  assert.strictEqual(blocked.allowed, false);
  assert.strictEqual(blocked.remaining, 0);
  assert(blocked.retryAfterSec > 0, "retryAfterSec should be greater than 0");
});

it("extracts client IP from x-forwarded-for header", () => {
  const req1 = new Request("http://localhost/api/test", {
    headers: { "x-forwarded-for": "203.0.113.195, 70.41.3.18" },
  });
  assert.strictEqual(getClientIp(req1), "203.0.113.195");

  const req2 = new Request("http://localhost/api/test", {
    headers: { "x-real-ip": "198.51.100.44" },
  });
  assert.strictEqual(getClientIp(req2), "198.51.100.44");

  const req3 = new Request("http://localhost/api/test");
  assert.strictEqual(getClientIp(req3), "127.0.0.1");
});

console.log("\n=================================================");
console.log(`Results: ${passed} passed, ${failed} failed`);
console.log("=================================================");

if (failed > 0) {
  process.exit(1);
}
