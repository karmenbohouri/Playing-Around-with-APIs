let allCities = [];
async function loadCities() {
    const container = document.getElementById("cities");

    container.textContent = "Loading...";

    try {
        let exchangeRates = {};

        try {
            const exchangeData = await getExchangeRates();
            exchangeRates = exchangeData.rates;
        } catch (error) {
            console.error("Exchange rates error:", error);
        }

        const weatherResults = await Promise.allSettled(
            cities.map(city =>
                getWeather(city.latitude, city.longitude)
            )
        );

        const cityItems = cities.map((city, index) => {
            const result = weatherResults[index];

            if (result.status === "fulfilled") {
                return {
                    ...city,
                    temperature: result.value.temperature,
                    weatherCode: result.value.weatherCode,
                    exchangeRate: exchangeRates[city.currency]
                };
            }

            return {
                ...city,
                temperature: "N/A",
                weatherCode: -1,
                exchangeRate: exchangeRates[city.currency]
            };
        });

        allCities = cityItems;

        renderStats();

        updateDisplay();

    } catch (error) {
        container.textContent = 
             "Unable to load weather date. Please try again later.";

        console.error("Loading error:", error);
    }
}

function renderStats() {
    const statsContainer = document.getElementById("stats");

    statsContainer.textContent = "";

    const totalCities = allCities.length;

    const totalCountries = new Set(
        allCities.map(city => city.country)
    ).size;

    const destinationPill = document.createElement("span");
    destinationPill.className = "pill";
    destinationPill.textContent = `${totalCities} destinations`;

    const countryPill = document.createElement("span");
    countryPill.className = "pill";
    countryPill.textContent = `${totalCountries} countries`;

    statsContainer.append(destinationPill, countryPill);

    const validCities = allCities.filter(city =>
        city.temperature !== "N/A" &&
        Number.isFinite(Number(city.temperature))
    );

    if (validCities.length === 0) {
        return;
    }

    const hottestCity = validCities.reduce((a, b) => 
        Number(a.temperature) > Number(b.temperature) ? a : b
    );

    const coldestCity = validCities.reduce((a, b) => 
        Number(a.temperature) < Number(b.temperature) ? a : b   
    );

    const hottestPill = document.createElement("span");
    hottestPill.className = "pill pill-hot";
    hottestPill.textContent = 
        `Hottest: ${hottestCity.name} (${hottestCity.temperature}°C)`;
        
    const coldestPill = document.createElement("span");
    coldestPill.className = "pill pill-cold";
    coldestPill.textContent = 
         `Coldest: ${coldestCity.name} (${coldestCity.temperature}°C)`;

    statsContainer.append(hottestPill, coldestPill);
}

document.getElementById("search")
    .addEventListener("input", updateDisplay);

document.getElementById("country-filter")
    .addEventListener("change", updateDisplay);

document.getElementById("sort")
    .addEventListener("change", updateDisplay);

loadCities();

function updateDisplay() {
    const searchInput = document.getElementById("search");
    const countryFilter = document.getElementById("country-filter");
    const sortSelect = document.getElementById("sort");

    const searchText = searchInput.value.toLowerCase();
    const selectedCountry = countryFilter.value;
    const sortOption = sortSelect.value;

    let filteredCities = [...allCities];

    filteredCities = filteredCities.filter(city => 
        city.name.toLowerCase().includes(searchText)
    );

    if (selectedCountry !== "All countries") {
        filteredCities = filteredCities.filter(city => 
            city.country === selectedCountry
        );
    }

    if (sortOption === "name") {
        filteredCities.sort((a, b) => 
            a.name.localeCompare(b.name)
        );
    }

    if (sortOption === "temp-asc") {
        filteredCities.sort((a, b) => {
            const tempA = Number(a.temperature);
            const tempB = Number(b.temperature);

            const validA = Number.isFinite(tempA);
            const validB = Number.isFinite(tempB);

            if (!validA && !validB) return 0;
            if (!validA) return 1;
            if (!validB) return -1;


            return tempA - tempB;
        });
    }

    if (sortOption === "temp-desc") {
        filteredCities.sort((a, b) => {
            const tempA = Number(a.temperature);
            const tempB = Number(b.temperature);

            const validA = Number.isFinite(tempA);
            const validB = Number.isFinite(tempB);

            if (!validA && !validB) return 0;
            if (!validA) return 1;
            if (!validB) return -1;


            return tempB - tempA;
        });
    }

    renderCities(filteredCities);
}