document.addEventListener('DOMContentLoaded', function() {
    const difficultySelect = document.getElementById('leaderboardDifficultySelect');
    const leaderboardTitle = document.getElementById('pageLeaderboardTitle');
    const leaderboardList = document.getElementById('pageLeaderboardList');

    const SUPABASE_URL = "https://lcabqlfbfgpdkqrrmgpq.supabase.co";
    const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjYWJxbGZiZmdwZGtxcnJtZ3BxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4ODk4MzgsImV4cCI6MjA5NzQ2NTgzOH0.t8PSeaBS28H0eeChTurquSy9XP32WZR6-cxy_TOxKgo";

    async function displayScores() {
        const mode = difficultySelect.value;
        leaderboardTitle.innerText = `${mode.charAt(0).toUpperCase() + mode.slice(1)} Top Scores`;
        leaderboardList.innerHTML = "<li>Loading global rankings...</li>";
        
        try {
            const targetUrl = `${SUPABASE_URL}/rest/v1/leaderboards?difficulty=eq.${mode}&order=time.asc&limit=5`;
            
            const response = await fetch(targetUrl, {
                method: "GET",
                headers: {
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!response.ok) throw new Error("Could not fetch data");
            const scores = await response.json();

            leaderboardList.innerHTML = "";

            if (scores.length === 0) {
                leaderboardList.innerHTML = "<li>No global scores recorded yet!</li>";
                return;
            }

            scores.forEach(function(entry) {
                const li = document.createElement('li');
                li.innerHTML = `<span>${entry.name}</span> <span>${entry.time}s</span>`;
                leaderboardList.appendChild(li);
            });

        } catch(e) {
            console.error(e);
            leaderboardList.innerHTML = "<li>Error connecting to global server.</li>";
        }
    }

    difficultySelect.addEventListener('change', displayScores);
    displayScores();
});