document.addEventListener("DOMContentLoaded", function () {
    // Toggle the social media menu visibility
    document.querySelector(".hamburger-menu").addEventListener("click", function () {
        let menu = document.getElementById("socialMediaMenu");
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    });

    // Show analysis for selected platform
    window.showAnalysis = function (platform) {
        let analysisContainer = document.getElementById("analysisContainer");
        let platformName = document.getElementById("platformName");

        platformName.textContent = platform.charAt(0).toUpperCase() + platform.slice(1);
        analysisContainer.style.display = "block";
    };

    // Handle form submission
    document.querySelector("form").addEventListener("submit", function (event) {
        event.preventDefault();
        let keyword = document.getElementById("keyword").value;
        let language = document.getElementById("language").value;
        displayResults(keyword, language);
    });

    function displayResults(keyword, language) {
        let resultsContainer = document.getElementById("resultsContainer");
        let tableBody = document.getElementById("resultsTableBody");

        let mockData = [
            { keyword: keyword, volume: Math.floor(Math.random() * 1000) + 100, competition: "Medium" },
            { keyword: keyword + " tips", volume: Math.floor(Math.random() * 2000) + 200, competition: "High" },
            { keyword: keyword + " guide", volume: Math.floor(Math.random() * 1500) + 300, competition: "Low" }
        ];

        tableBody.innerHTML = "";
        mockData.forEach(data => {
            let row = `<tr>
                <td>${data.keyword}</td>
                <td>${data.volume}</td>
                <td>${data.competition}</td>
            </tr>`;
            tableBody.innerHTML += row;
        });

        resultsContainer.style.display = "block";
    }

    // Add event listeners for social media icons
    document.querySelectorAll(".social-media-icons a").forEach(icon => {
        icon.addEventListener("click", function (event) {
            event.preventDefault();
            let platform = this.getAttribute("onclick").replace("showAnalysis('", "").replace("')", "");
            showAnalysis(platform);
        });
    });
});
