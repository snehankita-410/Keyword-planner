const express = require("express");
const cors = require("cors");
const axios = require("axios");
const { spawn } = require("child_process");

const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Scaling Factors
const GOOGLE_TRENDS_MULTIPLIER = 27400;
const YOUTUBE_MULTIPLIER = 2000;
const INSTAGRAM_MULTIPLIER = 50;
const FACEBOOK_MULTIPLIER = 500;
const PINTEREST_MULTIPLIER = 700;
const PLAYSTORE_MULTIPLIER = 800;
const LINKEDIN_MULTIPLIER = 300;
const TWITTER_MULTIPLIER = 400;

// 📌 Delay function to wait before retrying
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// 📌 Google Trends Search Volume (via Python script)
async function getGoogleSearchVolume(keyword) {
    return new Promise((resolve, reject) => {
        const process = spawn("python3", ["google_trends.py", keyword]); // ✅ Use "python3" for Render

        let dataBuffer = "";
        process.stdout.on("data", (data) => {
            dataBuffer += data.toString();
        });

        process.on("close", () => {
            const searchVolume = parseInt(dataBuffer.trim()) || 0;
            resolve(searchVolume * GOOGLE_TRENDS_MULTIPLIER);
        });

        process.stderr.on("data", (data) => {
            console.error(`Google Trends Error: ${data}`);
            reject(0);
        });
    });
}


// 📌 YouTube Search Volume
async function getYouTubeVolume(keyword) {
    try {
        const response = await axios.get(`https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${keyword}`);
        return response.data[1] ? response.data[1].length * YOUTUBE_MULTIPLIER : 0;
    } catch (error) {
        console.error("🚨 YouTube API Error:", error.message);
        return 0;
    }
}

// 📌 Estimated Search Volumes for Other Platforms
async function getInstagramVolume(keyword) { return keyword.length * INSTAGRAM_MULTIPLIER; }
async function getFacebookVolume(keyword) { return keyword.length * FACEBOOK_MULTIPLIER; }
async function getPinterestVolume(keyword) { return keyword.length * PINTEREST_MULTIPLIER; }
async function getPlayStoreVolume(keyword) { return keyword.length * PLAYSTORE_MULTIPLIER; }
async function getLinkedInVolume(keyword) { return keyword.length * LINKEDIN_MULTIPLIER; }
async function getTwitterVolume(keyword) { return keyword.length * TWITTER_MULTIPLIER; }

// 📌 Timeout Wrapper to Prevent Hanging Requests
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Request Timeout")), ms)
    );
    return Promise.race([promise, timeout]);
}

// 📌 API Route to Get Search Volume
app.post("/search-volume", async (req, res) => {
    const { keyword } = req.body;
    if (!keyword) return res.status(400).json({ error: "Keyword is required" });

    try {
        const [
            googleVolume,
            youtubeVolume,
            instagramVolume,
            facebookVolume,
            pinterestVolume,
            playStoreVolume,
            linkedInVolume,
            twitterVolume
        ] = await Promise.all([
            withTimeout(getGoogleSearchVolume(keyword), 5000),
            withTimeout(getYouTubeVolume(keyword), 5000),
            getInstagramVolume(keyword),
            getFacebookVolume(keyword),
            getPinterestVolume(keyword),
            getPlayStoreVolume(keyword),
            getLinkedInVolume(keyword),
            getTwitterVolume(keyword)
        ]);

        res.json({
            keyword,
            search_volume: [
                { platform: "Google", searches: googleVolume },
                { platform: "YouTube", searches: youtubeVolume },
                { platform: "Instagram", searches: instagramVolume },
                { platform: "Facebook", searches: facebookVolume },
                { platform: "Pinterest", searches: pinterestVolume },
                { platform: "Play Store", searches: playStoreVolume },
                { platform: "LinkedIn", searches: linkedInVolume },
                { platform: "Twitter", searches: twitterVolume }
            ]
        });
    } catch (error) {
        console.error("🚨 Error fetching search volume:", error);
        res.status(500).json({ error: "Failed to fetch search volume" });
    }
});

// 📌 Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
