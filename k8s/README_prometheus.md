## Monitorering (Prometheus)

1. Apply det hele (inkl. Prometheus):
   `kubectl apply -k k8s`
2. Genstart API-podsene, så de henter det nyeste image (med `/metrics`):
   `kubectl rollout restart deployment/api -n booking`
3. Tjek, at alle pods kører:
   `kubectl get pods -n booking`
4. Åbn Prometheus (lad terminalen stå åben):
   `kubectl port-forward -n booking svc/prometheus 9090:9090`
   Gå derefter til http://localhost:9090
5. Tjek, at hver API-pod bliver scrapet. Under **Status → Targets** skal jobbet `api` vise ét target pr. pod, alle med **UP**.
6. Åbn Grafana (lad terminalen stå åben):
   `kubectl port-forward -n booking svc/grafana 3000:3000`
   Gå til http://localhost:3000, log ind med `admin` / `admin`, og vælg **Explore → Prometheus**.
   Kør denne query for API-podernes readiness: `max by (pod) (up{job="api", pod_ready="true"}) or on (pod) (max by (pod) (up{job="api", pod_ready="false"}) * 0)`.
   Værdien `1` betyder Ready; `0` betyder ikke Ready. Grafen viser kun pods, som Prometheus stadig finder.
7. Få en URL til API'et (lad terminalen stå åben):
   `minikube service api -n booking --url`
   Brug ikke `kubectl port-forward svc/api`. Den sender al trafik til én pod.
8. Lav trafik (fra repo-roden):
   `dotnet run --project LoadTest -- reads 20 120 <url-fra-step-7>`
9. Kør disse queries i Prometheus (skift til fanen **Graph**):
    - Requests pr. sekund pr. pod:
      `sum by (pod) (rate(http_server_request_duration_seconds_count{job="api"}[1m]))`
    - p95-latency pr. endpoint:
      `histogram_quantile(0.95, sum by (le, http_route) (rate(http_server_request_duration_seconds_bucket{job="api"}[1m])))`