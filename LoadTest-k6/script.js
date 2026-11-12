import http from 'k6/http';
import { Counter } from 'k6/metrics';

const mode = __ENV.MODE;          // "reads" eller "writes"
const baseUrl = __ENV.BASE_URL;   // fx "http://localhost:5133"

const refusals = new Counter('refusals');
http.setResponseCallback(http.expectedStatuses(200, 409));   // 409 er ikke en fejl

export default function () {
    const section = Math.floor(Math.random() * 4) + 1;   // 1–4

    let res;
    if (mode === 'reads') {
        res = http.get(`${baseUrl}/sections/${section}`);
    } else {
        // LOOK HERE! POST /sections/{id}/buy
        res = http.post(
            `${baseUrl}/sections/${section}/buy`,
            JSON.stringify({ name: `vu-${__VU}`, count: 1 }),
            { headers: { 'Content-Type': 'application/json' } }
        );
    }

    if (res.status === 409) refusals.add(1);
}