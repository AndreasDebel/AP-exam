import http from 'k6/http';
import { Counter } from 'k6/metrics';

// One k6 run = all load steps of one scenario run (docs/metrics/test-description.md).
// Step 1 sends START requests/s for 1 minute, step 2 START+STEP, and so on, STEPS times.
const mode = __ENV.MODE;                  // "reads" eller "writes"
const baseUrl = __ENV.BASE_URL;           // fx "http://127.0.0.1:54321" fra "minikube service api -n booking --url"
const start = Number(__ENV.START);        // requests pr. sekund i første trin, fx 50
const stepSize = Number(__ENV.STEP);      // hvor meget hvert trin lægger til, fx 50
const stepCount = Number(__ENV.STEPS);    // antal trin, fx 8
const split = __ENV.SPLIT === 'yes';      // Scenario 6 (fault isolation): database a og b får hver sin halvdel, se nedenfor

// Each step is its own k6 "scenario": 1 minute at a fixed rate, then a 30 s pause before the next one starts.
// The pause lets requests from the previous step finish (k6 waits up to 30 s for them), so steps never overlap,
// and it shows up as a dip between the steps in Grafana.
// The scenario is named after its rate, e.g. "rate_150". k6 tags every request with that name, which the
// thresholds below use to print one line per step.
const scenarios = {};
const thresholds = {};

// Warm-up: 1 minute at the first step's rate before any step is measured. A freshly started API spends its
// first seconds compiling code (JIT) and opening database connections, which made the first step's p95 too high.
// It gets no threshold lines, so it shows up in Grafana but not as a line of its own in k6's summary.
// Its requests still count in k6's overall totals at the bottom; the per-step lines are what goes in the tables.
scenarios['warmup'] = {
    executor: 'constant-arrival-rate',
    rate: start,
    timeUnit: '1s',
    duration: '1m',
    startTime: '0s',
    preAllocatedVUs: 30,
    maxVUs: 30,
};
const warmupLength = 90;   // seconds: 60 s warm-up + 30 s pause. Every step starts this much later.

for (let i = 0; i < stepCount; i++) {
    const rate = start + i * stepSize;
    const name = `rate_${rate}`;

    if (split) {
        // Scenario 6 (fault isolation): two scenarios per step, one per database, each at half the rate with
        // its own 15 VUs. A buy to a dead database b that hangs can then only use up b's VUs, never a's,
        // so a's numbers show what the system does to a, not that k6 ran out of VUs (test-description.md, 6).
        // The scenario's env DB tells the default function below which sections to buy in.
        scenarios[`${name}_a`] = {
            executor: 'constant-arrival-rate',
            rate: rate / 2,
            timeUnit: '1s',
            duration: '1m',
            startTime: `${warmupLength + i * 90}s`,
            preAllocatedVUs: 15,
            maxVUs: 15,
            env: { DB: 'a' },
        };
        scenarios[`${name}_b`] = {
            executor: 'constant-arrival-rate',
            rate: rate / 2,
            timeUnit: '1s',
            duration: '1m',
            startTime: `${warmupLength + i * 90}s`,
            preAllocatedVUs: 15,
            maxVUs: 15,
            env: { DB: 'b' },
        };
        // Same summary lines as below, one set per database.
        thresholds[`http_req_duration{scenario:${name}_a}`] = ['p(95)>=0'];
        thresholds[`http_req_failed{scenario:${name}_a}`] = ['rate>=0'];
        thresholds[`dropped_iterations{scenario:${name}_a}`] = ['count>=0'];
        thresholds[`http_req_duration{scenario:${name}_b}`] = ['p(95)>=0'];
        thresholds[`http_req_failed{scenario:${name}_b}`] = ['rate>=0'];
        thresholds[`dropped_iterations{scenario:${name}_b}`] = ['count>=0'];
        continue;
    }

    scenarios[name] = {
        executor: 'constant-arrival-rate',   // fast fart: rate requests pr. sekund, uanset hvor hurtigt API'en svarer
        rate: rate,
        timeUnit: '1s',
        duration: '1m',
        startTime: `${warmupLength + i * 90}s`,   // efter warm-up, så 60 s trin + 30 s pause
        preAllocatedVUs: 30,
        maxVUs: 30,   // writes: API'ens connection pool (test-description.md, VUs)
    };

    // Ikke pass/fail-grænser (">= 0" er altid sandt). Linjerne får bare k6 til at skrive tallene
    // ud for hvert trin i sin opsummering: svartid og fejlprocent for trinnet som helhed (tabellen),
    // for database a og b hver for sig, og om k6 nåede at sende det hele.
    thresholds[`http_req_duration{scenario:${name}}`] = ['p(95)>=0'];
    thresholds[`http_req_failed{scenario:${name}}`] = ['rate>=0'];
    thresholds[`http_req_duration{scenario:${name},db:a}`] = ['p(95)>=0'];
    thresholds[`http_req_failed{scenario:${name},db:a}`] = ['rate>=0'];
    thresholds[`http_req_duration{scenario:${name},db:b}`] = ['p(95)>=0'];
    thresholds[`http_req_failed{scenario:${name},db:b}`] = ['rate>=0'];
    thresholds[`dropped_iterations{scenario:${name}}`] = ['count>=0'];
}

// k6 reads "options" before it starts, and runs the default function below at each scenario's rate.
export const options = {
    scenarios: scenarios,
    thresholds: thresholds,
};

const refusals = new Counter('refusals');
http.setResponseCallback(http.expectedStatuses(200, 409));   // 409 er ikke en fejl (oversell-checket)

export default function () {
    // Loadtest-sektionerne 101-140 (k8s/api.yaml): 101-120 i database a, 121-140 i database b.
    // With SPLIT=yes each step's scenario sets DB, and only that database's 20 sections are used.
    let first = 101;
    let count = 40;
    if (__ENV.DB === 'a') {
        count = 20;
    }
    if (__ENV.DB === 'b') {
        first = 121;
        count = 20;
    }
    const section = first + Math.floor(Math.random() * count);
    let db = 'b';
    if (section <= 120) {
        db = 'a';
    }
    const params = { tags: { db: db }, headers: { 'Content-Type': 'application/json' } };

    let res;
    if (mode === 'reads') {
        // LOOK HERE! GET /sections/{id} i api/Program.cs
        res = http.get(`${baseUrl}/sections/${section}`, params);
    } else {
        // LOOK HERE! POST /sections/{id}/buy i api/Program.cs
        res = http.post(`${baseUrl}/sections/${section}/buy`, JSON.stringify({ count: 1 }), params);
    }

    if (res.status === 409) refusals.add(1);
}

// k6 calls setup() once, before the first step starts. What it returns is handed to teardown() below.
export function setup() {
    return { startedAt: Date.now() / 1000 };   // Unix time in seconds, the unit Prometheus uses
}

// k6 calls teardown() once, after the last step is done. It asks Prometheus how busy the busiest API pod
// and the busiest Postgres pod were in each step, and prints one line per step, just above k6's summary.
// Needs the Prometheus port-forward from README step 3 (localhost:9090) to still be running.
// Dropped on purpose: an error message if Prometheus can't be reached. The script crashes here instead.
export function teardown(data) {
    console.log('CPU per step (busiest pod in cores, 0.25 = its limit):');
    for (let i = 0; i < stepCount; i++) {
        const rate = start + i * stepSize;
        // Step i ends 60 s after it starts; steps start after the warm-up, 90 s apart (see startTime above).
        const stepEnd = data.startedAt + warmupLength + i * 90 + 60;
        const api = busiestPodCpu('api-.*', stepEnd);
        const postgres = busiestPodCpu('postgres-.*', stepEnd);
        console.log(`rate_${rate}: API ${api}  Postgres ${postgres}`);
    }
}

// The same CPU numbers as Grafana's "CPU per pod" panel, but averaged over the step's whole minute
// ([1m] ending at stepEnd) and only for the busiest pod whose name matches podPattern.
function busiestPodCpu(podPattern, stepEnd) {
    const query = `max(sum by (pod) (rate(container_cpu_usage_seconds_total{job="cadvisor", namespace="booking", container!="", pod=~"${podPattern}"}[1m])))`;
    // LOOK HERE! Asks Prometheus (k8s/prometheus.yaml) through the port-forward from README step 3.
    const res = http.get(`http://localhost:9090/api/v1/query?query=${encodeURIComponent(query)}&time=${stepEnd}`);
    // Prometheus answers e.g. {"data":{"result":[{"value":[1732456789,"0.734"]}]}}: [time, value as text].
    const value = res.json().data.result[0].value[1];
    return Number(value).toFixed(2);
}
