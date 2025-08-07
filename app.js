// app.js (Modified with Enter key, Loading text, ESC to close modal, Pagination, and Type Filter)

const searchBtn = document.getElementById("searchBtn");
const queryInput = document.getElementById("query");
const typeFilter = document.getElementById("typeFilter");
const moviesContainer = document.getElementById("movies");
const modal = document.getElementById("modal");
const modalDetails = document.getElementById("modal-details");
const closeBtn = document.querySelector(".close-btn");
const pagination = document.getElementById("pagination");

const API_KEY = '704e8fb4';
let currentPage = 1;
let currentQuery = '';

searchBtn.addEventListener("click", () => {
  const query = queryInput.value.trim();
  if (query !== "") {
    currentQuery = query;
    currentPage = 1;
    fetchMovies(currentQuery, currentPage);
  }
});

queryInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    searchBtn.click();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && modal.classList.contains("show")) {
    modal.classList.remove("show");
  }
});

async function fetchMovies(searchTerm, page = 1) {
  moviesContainer.innerHTML = `<p style="font-style: italic;">Searching...</p>`;
  const type = typeFilter.value;

  try {
    const response = await fetch(`https://www.omdbapi.com/?s=${encodeURIComponent(searchTerm)}&type=${type}&page=${page}&apikey=${API_KEY}`);
    const data = await response.json();
    if (data.Response === "True") {
      displayMovies(data.Search);
      showPagination(data.totalResults);
    } else {
      moviesContainer.innerHTML = `<p>No results found.</p>`;
      pagination.innerHTML = "";
    }
  } catch (error) {
    moviesContainer.innerHTML = `<p>Error fetching data. Please try again.</p>`;
    console.error("Fetch error:", error);
  }
}

function displayMovies(movies) {
  moviesContainer.innerHTML = "";
  movies.forEach(movie => {
    const movieCard = document.createElement("div");
    movieCard.classList.add("movie-card");

    const poster = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image";
    const isFavorited = isInWatchlist(movie.imdbID);

    movieCard.innerHTML = `
      <div class="poster-wrapper">
        <img src="${poster}" alt="${movie.Title}" data-imdb="${movie.imdbID}" class="poster-image">
      </div>
      <div class="movie-info">
        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" data-id="${movie.imdbID}">&#9733;</button>
        <h3>${movie.Title}</h3>
        <p>${movie.Year}</p>
      </div>
    `;

    movieCard.querySelector("img").addEventListener("click", () => {
      fetchMovieDetails(movie.imdbID);
    });

    movieCard.querySelector(".favorite-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      toggleWatchlist(movie);
      e.target.classList.toggle("favorited");
    });

    moviesContainer.appendChild(movieCard);
  });
}


async function fetchMovieDetails(imdbID) {
  try {
    const response = await fetch(`https://www.omdbapi.com/?i=${imdbID}&apikey=${API_KEY}`);
    const data = await response.json();
    if (data.Response === "True") {
      showModal(data);
    } else {
      alert("Movie details not found.");
    }
  } catch (error) {
    console.error("Details fetch error:", error);
  }
}

function showModal(movie) {
  modalDetails.innerHTML = `
    <span class="close-btn">&times;</span>
    <h2>${movie.Title} (${movie.Year})</h2>
    <div class="poster-wrapper">
      <img src="${movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/300x450?text=No+Image"}" alt="${movie.Title}" class="poster-image">
    </div>
    <p><strong>Genre:</strong> ${movie.Genre}</p>
    <p><strong>Runtime:</strong> ${movie.Runtime}</p>
    <p><strong>Plot:</strong> ${movie.Plot}</p>
    <p><strong>Director:</strong> ${movie.Director}</p>
    <p><strong>Actors:</strong> ${movie.Actors}</p>
    <p><strong>IMDb Rating:</strong> ${movie.imdbRating}</p>
  `;
  modal.classList.add("show");
  modal.scrollIntoView({ behavior: "smooth" });
}

modal.addEventListener("click", (e) => {
  if (e.target.classList.contains("close-btn")) {
    modal.classList.remove("show");
  }
});

function showPagination(totalResults) {
  const totalPages = Math.ceil(totalResults / 10);
  pagination.innerHTML = "";

  if (totalPages <= 1) return;

  if (currentPage > 1) {
    const prevBtn = document.createElement("button");
    prevBtn.textContent = "Previous";
    prevBtn.onclick = () => {
      currentPage--;
      fetchMovies(currentQuery, currentPage);
    };
    pagination.appendChild(prevBtn);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.onclick = () => {
      currentPage++;
      fetchMovies(currentQuery, currentPage);
    };
    pagination.appendChild(nextBtn);
  }
}

function getWatchlist() {
  return JSON.parse(localStorage.getItem("watchlist") || "[]");
}

function saveWatchlist(list) {
  localStorage.setItem("watchlist", JSON.stringify(list));
}

function isInWatchlist(imdbID) {
  const watchlist = getWatchlist();
  return watchlist.some(movie => movie.imdbID === imdbID);
}

function toggleWatchlist(movie) {
  let watchlist = getWatchlist();
  const exists = watchlist.find(m => m.imdbID === movie.imdbID);
  if (exists) {
    watchlist = watchlist.filter(m => m.imdbID !== movie.imdbID);
  } else {
    watchlist.push(movie);
  }
  saveWatchlist(watchlist);
}
const showFavoritesBtn = document.getElementById("showFavoritesBtn");

showFavoritesBtn.addEventListener("click", () => {
  const watchlist = getWatchlist();
  displayMovies(watchlist);
  pagination.innerHTML = "";
});

const themeToggleBtn = document.createElement('button');
themeToggleBtn.id = 'toggleThemeBtn';
themeToggleBtn.innerHTML = '<img src=\"moon.png\" width=\"20\" height=\"20\" />';
document.body.appendChild(themeToggleBtn);

themeToggleBtn.addEventListener('click', () => {
  document.body.classList.toggle('dark-mode');
  const icon = document.body.classList.contains('dark-mode') ? 'moon.png' : 'sun.png';
  themeToggleBtn.innerHTML = `<img src=\"${icon}\" width=\"20\" height=\"20\" />`;
});

