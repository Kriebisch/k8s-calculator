# K8s Calculator

A distributed calculator built as a hands-on project to practice containerization, Kubernetes and CI/CD. Instead of one application, every arithmetic operation runs as its own small service. A central API orchestrates them and persists calculations in PostgreSQL. Everything runs locally in a Kubernetes cluster behind an Ingress.

The project is intentionally a work in progress. The current state is a stable baseline (services, cluster, database, CI); the next steps are listed in the [Roadmap](#roadmap).

## Architecture

```
Browser → Ingress ─┬─ /     → frontend
                   └─ /api  → calculator-api ─┬→ addition-service
                                  │           ├→ subtraction-service
                                  │           ├→ multiplication-service
                                  │           └→ division-service
                                  └→ PostgreSQL
```

| Component | Role |
|---|---|
| **Ingress** | Single entry point from outside, routes by path |
| **frontend** | Web UI for entering calculations |
| **calculator-api** | Orchestrates the operation services and stores calculations via Prisma |
| **addition / subtraction / multiplication-service** | One operation each (Node.js, Express) |
| **division-service** | Division (Python) |
| **PostgreSQL** | Persistent storage for calculations |

Splitting the operations into separate services is deliberate: it makes the cluster concepts (Deployments, Services, Ingress, configuration, persistence) tangible with a domain that is trivial to understand.

## Tech stack

- **Services:** Node.js (Express 5), Python
- **Database:** PostgreSQL with Prisma
- **Containers & orchestration:** Docker, Kubernetes (local cluster), Ingress
- **Testing:** Jest and Supertest (Node), pytest (Python)
- **CI:** GitLab CI

## Running it locally

Tested on Docker Desktop with Kubernetes enabled (Windows). The manifests reference the images by their local names without a registry, so the cluster must be able to see your local Docker images.

**Prerequisites:** Docker Desktop with Kubernetes enabled, `kubectl`, Node.js (for the database migration).

**1. Install the Ingress controller.** The manifests in `k8s/` assume the NGINX Ingress controller. It is not part of this repository:

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.11.3/deploy/static/provider/cloud/deploy.yaml
kubectl wait --namespace ingress-nginx \
  --for=condition=ready pod \
  --selector=app.kubernetes.io/component=controller \
  --timeout=120s
```

**2. Create the database secret.** The PostgreSQL credentials are not part of this repository. Create the secret yourself with your own values. `DATABASE_URL` points to the `postgres` service inside the cluster (special characters in the password must be percent-encoded in the URL):

```bash
kubectl create secret generic postgres-secret \
  --from-literal=POSTGRES_USER=<user> \
  --from-literal=POSTGRES_PASSWORD=<password> \
  --from-literal=POSTGRES_DB=<database> \
  --from-literal=DATABASE_URL=postgresql://<user>:<password>@postgres:5432/<database>
```

**3. Build the images.** The manifests reference the images by these local names, so they must be built under exactly these tags:

```bash
docker build -t frontend ./frontend
docker build -t calculator-api ./calculator-api
docker build -t addition-service ./addition-service
docker build -t subtraction-service ./subtraction-service
docker build -t multiplication-service ./multiplication-service
docker build -t division-service ./division-service
```

**4. Start PostgreSQL.** The StatefulSet stores its data on a persistent volume, so the database survives pod restarts. It reads its credentials from the secret created in step 2:

```bash
kubectl apply -f k8s/postgres-statefulset.yaml -f k8s/postgres-service.yaml
kubectl rollout status statefulset/postgres --timeout=120s
```

**5. Create the database schema.** The schema is managed with Prisma migrations. The database is not reachable from outside the cluster, so open a port-forward in a separate terminal and keep it running:

```bash
kubectl port-forward svc/postgres 5434:5432
```

Then apply the migrations from your local machine (use the same credentials as in the secret from step 2):

```bash
cd calculator-api
npm ci
export DATABASE_URL="postgresql://<user>:<password>@localhost:5434/<database>"
npx prisma migrate deploy
```

On Windows PowerShell, set the variable with `$env:DATABASE_URL = "..."` instead of `export`. On a fresh database this creates the tables; afterwards you can stop the port-forward.

**6. Deploy the services.** Apply all manifests (deployments, services and the Ingress) and wait until every deployment is available:

```bash
kubectl apply -f k8s/
kubectl wait --for=condition=available deployment --all --timeout=180s
```

**7. Open the app.** The Ingress routes `localhost`: `/` goes to the frontend, `/api` to the calculator-api. Open:

```
http://localhost
```

## Tests and CI

Each service has its own test suite. The GitLab CI pipeline runs one job per service on every push:

| Job | Runs |
|---|---|
| `verify-calculator-api` | `prisma generate`, then Jest |
| `test-addition-service` | Jest |
| `test-subtraction-service` | Jest |
| `test-multiplication-service` | Jest |
| `test-division-service` | pytest |

The pipeline definition lives in `.gitlab-ci.yml`. CI runs on GitLab, so there is no pipeline status on this GitHub mirror.

## Roadmap

- **Gateway:** an internal layer between the API and the operation services, so the API no longer needs to know each service individually
- **Dynamic calculations:** replace the fixed chain of operations with a list of steps of arbitrary length
- **More operations:** new operations become a new service plus a registry entry
- **New frontend:** rebuild the UI in React
- **CI extensions:** database integration tests and a frontend job once the new structure is in place
