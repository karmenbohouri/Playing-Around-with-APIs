# Playing-Around-with-APIs
# Travel Weather Planner

A responsive web application that allows users to explore waether conditions and exchange rates across 20 cities in 10 countries.

The application retrieves current weather information and exchnge rates from public APIs. Users can search, filter, and sort destinations to compare conditions around the world.

## Live Application

- **Deployed application:** https://35.175.242.143
- **GitHub repository:** https://github.com/karmenbohouri/Playing-Around-with-APIs
- **Demo video:** [add video link]

## Features

- Display current weather conditions for 20 cities across 10 countries.
- Shows current temperature and weather descriptions.
- Display exchange rates based on XOF (West African CFA franc).
- Converts 1,000 FCFA into each destination's local currency.
- Search destinations by city name.
- Filter destinations by country.
- Sort destinations alphabetically or by temperature.
- Displays statistics, including the hottest and coldest cities.
- Handles API errors and unavailable data without stopping the entire application.
- Responsive interface for different screen sizes.

## Technologies Used

- HTML5
- CSS3
- JavaScript (Vanilla Javascript)
- Open-Meteo API
- ExchangeRate-API
- Nginx
- HAProxy 
- Linux / Ubuntu
- Git and GitHub

## Project Structure 

```text
Playing-Around-with-APIs/
│
├── index.html
├── README.md
├── .gitignore
│
├── css/
│   └── style.css
│
└── js/
    ├── api.js
    ├── cities.js
    ├── main.js
    └── ui.js
```

## APIs Used

### 1. Open-Meteo API

Used to retrieve current weather information, including temperature and weather codes, using geographical coordinates.

- Documentation: https://open-meteo.com/en/docs
- Endpoint: `https://api.open-meteo.com/v1/forecast`
- Data retrieved:  `temperature_2m` and `weather_code`.

### 2. ExchangeRate-API

Used to retrieve currency exchange rates based oh XOF.

- Documentation:  https://www.exchangerate-api.com/docs/free
- Endpoint: `https://open.er-api.com/v6/latest/XOF`
- Data retrieved: currency rates and next update timetamp.

**API requirements:** No API key, account, credentials, or authentication is required tu run this application.

## Runnung the Application Locally

### Prerequisites

- A modern web browser.
- Git.
- An internet connection to access the external APIs.

No package installation or build process is required.

### Installation

1. Clone the repository:

```bash
git clone https://github.com/karmenbohouri/Playing-Around-with-APIs.git
```

2. Navigate imto the project directory:

```bash
cd Playing-Around-with-APIs
```

3. Open `index.html` in a web browser.

Alternatively, use the Live Server extension is Visual Studio Code.

The application will load weather and exchange rate data automatically.

### Deployment Architecture

The application is deployed on two web servers behind a load balencer.

                 Users
                   |
                   v
             Load Balancer
                Lb01
               HAProxy
                   |
          Round Robin Algorithm
              /         \
             /           \
            v             v
       Web01             Web02
       Nginx             Nginx
            \             /
             \           /
              Application

### Server Conficuration 

| Server | Role | IP Address |
|---|---|---|
| Web01 | Web server (Nginx) | 32.192.231.221 |
| Web02 | Web server (Nginx) | 98.93.200.142 |
| Lb01 | Load balancer (HAProxy) | 35.175.242.143 |

### Deploying the Application on Web01 and Web02

The application files are hosted in:

```text
/var/www/html
```

on each web server:

1. Install Nginx if is not already installed:

```bash
sudo apt update
sudo apt install nginx -y
```

2. Copy the project files into `/var/www/html`.

3. Ensure Nginx is running and enabled:

```bash
sudo systemctl enable nginx
sudo systemtl start nginx
```

4. Test the web server locally:

```bash
curl -I http://localhost
```

Repeat these on both Web01 and Web02.

### Configuring HAProxy on Lb01

HAProxy is used distribute incoming requests between the two web servers.

Configuration file:

```text
/etc/haproxy/haproxy.cfg
```

The backend used the Round Robin algorithm:

```haproxy
frontend http_front
    bind *:80
    redirect scheme https code 301 if !{ ssl_fc }
    default_backend http_back

frontend https_front
    bind *:443 ssl crt /etc/haproxy/certs/www.51karmenbohouri.tech.pem
    default_backend http_back

backend http_back
    balance roundrobin
    server 7059-web-01 32.192.231.221:80 check
    server 7059-web-02 98.93.200.142:80 check
```

Validate the HAProxy configuration:

```bash
sudo haproxy -c -f /etc/haproxy/haproxy.cfg
```

Restart HAProxy if configuration changes are made:

```bash
sudo systemctl restart haproxy
```

Check its status: 

```bash
sudo systemctl status haproxy
```

## Testing

The following tests were performed to verify deployment and load balancing.

### 1. Test Web01

```bash
curl -I http://32.192.231.221
```

Expected result: HTTP 200 OK.

### 2. Test Web02

```bash
curl -I http://98.93.200.142
```

Expected result: HTTP 200 OK.

### 3. Test HAProxy

```bash
sudo systemctl is-active haproxy
```

Expected result:

```text
active
```

### 4. Test Load Balancing

The following command sends ten separate HTTPS requests to the load balencer:

```bash
for i in {1..10}; do
     curl -sk -I -H "connection close" https://localhost | grep -i '^x-served-by:'
done
```

The `X-Served-By` response header identifies which web server handled each request.

**Observed result:**

- Web01 handled 5 requests.
- Web02 handled 5 requests.
- Requests alternated between both servers.

This confirms that HAProxy succesfully distributes traffic using the Round Robin algorithm.

### 5. Test the Public Application

Open:

https://35.175.242.143

The application was also tested through the public load balancer address.

## Chalenges an Solutions

### 1. configuring Two Web Servers

**Challenge:** Ensuring that the application was coorectly deployed and accessible on both servers.

**Solution:** Deployed the same application files to Wen01 and Web02 and tested each server independently.

### 2. Configuring the Load Balancer 

**Challenge:** Distributing incoming requests between two web servers.

**Solutions:** Configured HAProxy with the Round Robin algorithm and health checks for both backend servers.

### 3. Verifying Traffic Distribution 

**Challenge:** Confirming which server handle each request.

**Solution:** Used a custom`X-Served-By` response header and repeated curl requests to verify traffic distribution.

### 4. Handling API Errors

**Challenge:** External API requests may fail or return unavailable data.

**Solution:** Implemented error handling and `Promise.allSettled()` so that one failed weather request does not prevent other cities from loading.

## Demo Video

[link here]

The demonstration should show:

1. The application running locally. 
2. The application accessed through the public load balancer.
3. Both web servers handling requests.
4. The Round Robin traffic distribution.

## Credits

- **Open-Meteo:** Weather data and API documentation — https://open-meteo.com/
- **ExchangeRate-API:** Exchange rate data — https://www.exchangerate-api.com/
- **Google Fonts:** Inter typeface — https://fonts.google.com/specimen/Inter

Weather data is provided by Open-Meteo. Exchange rate data is provided by ExchangeRate-API. Please refer to their respective documentation and terms of use.

---

**Project:** Travel Weather Planner
**Repository:** https://github.com/karmenbohouri/Playing-Around-with-APIs
**Author:** Karmen Bohouri