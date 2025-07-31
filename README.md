## VenueFinder App – Final Assignment Report

This project is a web-based Venue Finder application that helps users search, filter, and explore event venues across the globe. It is built using HTML, CSS, and JavaScript, integrates external APIs, and is containerized using Docker. It is deployed across multiple servers behind a load balancer, simulating a production-like infrastructure.


##  Part 1: Local Implementation

### Technology Stack

* Frontend: HTML, CSS, JavaScript (Vanilla)
* External APIs: Location-based APIs for venue data (mocked for demo)
* Runtime: Runs on a simple static HTTP server (Dockerized)

### Application Features

* Users can search for venues by:

  * 📍 Location
  * 🏢 Name
  * 🌿 Venue type (e.g., garden, hall, etc.)
  * 📅 Event Date
* Additional filters:

  * Guest capacity
  * Budget range
  * Amenities
  * Minimum rating
* Venue listings include:

  * Photos, location, features, availability, and pricing
  * Mock venue dataset displayed dynamically
  * Modal-based login/registration for users and venue owners

###  API Integration

Initially, the plan was to use **Google Maps or Places API**, but since an API key was unavailable, mock data was used to simulate venue listings.

The system is designed such that API integration can easily be enabled later by replacing the mock dataset (`sampleVenues`) with real data from a RESTful API.

### Running Locally

To run locally, any static file server or browser can be used:

```bash
npx serve .
# or simply open index.html in a browser
```



## Part 2A: Docker Containerization

To simplify deployment and ensure environment consistency, the app is containerized using Docker.

### Dockerfile Explanation

* A basic Nginx server is used to serve the static HTML/CSS/JS files.
* Files are copied into `/usr/share/nginx/html`.
* The container listens on port 8080.

###  Build & Test Locally

```bash
docker build -t venuefinder-app.
docker run -p 8080:8080 venuefinder-app
```

### Test Locally

```bash
curl http://localhost:8080
```

You should see the HTML of the homepage returned, confirming it’s working.



## Part 2B: Deployment on Servers

To simulate production, the app is deployed on three containers:

* Web01 – Application instance 1
* Web02 – Application instance 2
* Lb01 – Load balancer using HAProxy

### Deployment Steps

#### 1. Push Image to Docker Hub

```bash
docker tag venuefinder-app loicet/venuefinder-app:v1
docker login
docker push loicet/venuefinder-app:v1
```

#### 2. Deploy on Web01 and Web02

SSH into both servers and run:

```bash
docker pull loicet/venuefinder-app:v1
docker run -d --name app --restart unless-stopped -p 8080:8080 loicet/venuefinder-app:v1
```

Each instance is now reachable internally via:

* `http://web01:8080`
* `http://web02:8080`

#### 3. Configure Load Balancer (Lb01)

Open `/etc/haproxy/haproxy.cfg` and update the backend section:

```haproxy
backend webapps
    balance roundrobin
    server web01 172.20.0.11:8080 check
    server web02 172.20.0.12:8080 check
```

Then reload HAProxy to apply changes:

```bash
docker exec -it lb-01 sh -c 'haproxy -sf $(pidof haproxy) -f /etc/haproxy/haproxy.cfg'
```

#### 4. Test Load Balancing

Make several `curl` requests:

```bash
curl http://localhost:8082
```

You should see alternating responses from Web01 and Web02, confirming traffic is being load balanced.



## Logs to Capture for Submission

* Docker image build and push
* Running containers on Web01 and Web02
* Load balancer config (`haproxy.cfg`)
* Terminal showing alternating `curl` responses
* Final browser preview of the app



## Final Notes

* The project followed good software engineering practices: modular design, mock API data abstraction, Docker-based deployment, and high-availability setup using a load balancer.
* The application is ready to integrate real APIs in the future.
* The static design is clean, responsive, and offers a complete demo experience.



###  Project Complete
