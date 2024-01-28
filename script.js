const api = "https://pokeapi.co/api/v2/type/";

let pokemonList = [];

async function fetchPokimonData() {
    try {
        const response = await fetch(`${api}`);
        const data = await response.json();
        console.log(data);

        // Dynamically populate Pokémon types in the dropdown
        const typeSelect = document.getElementById('typeSelect');
        data.results.forEach(type => {
            const option = document.createElement('option');
            option.value = type.name;
            option.innerText = type.name.charAt(0).toUpperCase() + type.name.slice(1);
            typeSelect.append(option);
        });

        // Fetch initial Pokémon data on window load
        await fetchPokemonsByType('all');
    } catch (error) {
        console.log("Error fetching Pokémon types:", error);
    }
}

async function fetchPokemonsByType(type) {
    try {
        const response = await fetch(`${api}${type}`);
        const data = await response.json();

        pokemonList = await Promise.all(data.pokemon.map(async pokemon => {
            const imageUrl = await fetchPokemonData(pokemon.pokemon.url);
            const details = await fetchPokemonDetails(pokemon.pokemon.url);
            return {
                name: pokemon.pokemon.name,
                image: imageUrl,
                details: details
            };
        }));

        displayPokemon(pokemonList);
    } catch (error) {
        console.error(`Error fetching Pokémon data for type ${type}:`, error);
    }
}

function displayPokemon(pokemonArray) {
    const pokemonListDiv = document.getElementById("pokemonList");
    pokemonListDiv.innerHTML = "";

    pokemonArray.forEach(pokemon => {
        const flipCard = document.createElement('div');
        flipCard.classList.add("flip-card");

        const flipCardInner = document.createElement('div');
        flipCardInner.classList.add("flip-card-inner");

        const flipCardFront = document.createElement('div');
        flipCardFront.classList.add("flip-card-front");
        const img = document.createElement('img');
        img.src = pokemon.image;
        img.alt = pokemon.name;
        img.style.width = "100px";
        img.style.height = "100px";
        flipCardFront.appendChild(img);

        const flipCardBack = document.createElement('div');
        flipCardBack.classList.add("flip-card-back");
        const name = document.createElement("h1");
        name.textContent = pokemon.name;
        const detailsDiv = document.createElement("div");
        detailsDiv.classList.add("details");
        detailsDiv.innerHTML = formatPokemonDetails(pokemon.details);
        flipCardBack.appendChild(name);
        flipCardBack.appendChild(detailsDiv);

        flipCardInner.appendChild(flipCardFront);
        flipCardInner.appendChild(flipCardBack);

        flipCard.appendChild(flipCardInner);
        pokemonListDiv.appendChild(flipCard);

        // Add click event listener to flip the card
        flipCard.addEventListener("click", () => {
            flipCardInner.style.transform = flipCardInner.style.transform === "rotateY(180deg)" ? "rotateY(0deg)" : "rotateY(180deg)";
        });
    });
}

async function fetchPokemonDetails(pokemonURL) {
    const response = await fetch(pokemonURL);
    const parsedResponse = await response.json();
    return {
        abilities: parsedResponse.abilities.map(ability => ability.ability.name),
        stats: parsedResponse.stats.map(stat => ({ name: stat.stat.name, value: stat.base_stat })),
        // Add more details as needed
    };
}

function formatPokemonDetails(details) {
    let html = "<h3>Details:</h3>";
    html += "<ul>";
    details.abilities.forEach(ability => {
        html += `<li>Ability: ${ability}</li>`;
    });
    details.stats.forEach(stat => {
        html += `<li>${stat.name}: ${stat.value}</li>`;
    });
    // Add more details formatting as needed
    html += "</ul>";
    return html;
}

async function filterByType() {
    const selectedType = document.getElementById("typeSelect").value;
    await fetchPokemonsByType(selectedType);
}

function resetFilter() {
    document.getElementById("typeSelect").value = "all";
    fetchPokemonsByType("all");
    displayPokemon("");
}

async function fetchPokemonData(pokemonURL) {
    const response = await fetch(pokemonURL);
    const parsedResponse = await response.json();
    return parsedResponse.sprites.front_default;
}

fetchPokimonData();
