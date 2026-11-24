import http from 'k6/http';
import { Counter } from 'k6/metrics';

// One run = one load step (docs/metrics/test-description.md). Run the script once per step with a new RATE.
const mode = __ENV.MODE;          // "reads" eller "writes"
const baseUrl = __ENV.BASE_URL;   // fx "http://127.0.0.1:54321" fra "minikube service api -n booking --url"
const rate = Number(__ENV.RATE);  // requests pr. sekund i denne kørsel, fx 100

// k6 reads "options" before it starts and runs the default function below RATE times per second for 1 minute.
export const options = {
    scenarios: {
        step: {
            executor: 'constant-arrival-rate',   // fast fart: RATE requests pr. sekund, uanset hvor hurtigt API'en svarer
            rate: rate,
            timeUnit: '1s',
            duration: '1m',
            preAllocatedVUs: 50,
            maxVUs: 1000,   // mange, så requests der hænger (død database) ikke løber tør for VUs
        },
    },
    // Ikke en pass/fail-grænse (p95 >= 0 er altid sand). Linjerne får bare k6 til at skrive
    // svartiden for database a og b ud hver for sig i sin opsummering (fault isolation).
    thresholds: {
        'http_req_duration{db:a}': ['p(95)>=0'],
        'http_req_duration{db:b}': ['p(95)>=0'],
    },
};

const refusals = new Counter('refusals');
http.setResponseCallback(http.expectedStatuses(200, 409));   // 409 er ikke en fejl (oversell-checket)

export default function () {
    // Loadtest-sektionerne 101-140 (k8s/api.yaml): 101-120 i database a, 121-140 i database b.
    const section = 101 + Math.floor(Math.random() * 40);
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
