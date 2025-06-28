import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import './App.css';

function App() {
  const socketRef = useRef(null);
  const [players, setPlayers] = useState([]);

  const [region, setRegion] = useState("India");
  const [mode, setMode] = useState("solo");
  const [topN, setTopN] = useState(5);

  // Connect socket once
  useEffect(() => {
    socketRef.current = io("http://localhost:3000"); // use your render URL when deploying
    const socket = socketRef.current;

    console.log("🧪 Trying to connect to backend...");

    socket.on("connect", () => {
      console.log("✅ Connected to backend:", socket.id);
      fetchLeaderboard(); // fetch on initial load
    });

    socket.on("leaderboardUpdate", (players) => {
      setPlayers(players);
      console.log("📥 Leaderboard update:", players);
    });

    return () => socket.disconnect();
  }, []);

  const fetchLeaderboard = () => {
    const socket = socketRef.current;
    if (!socket) return;

    socket.emit("getLeaderboard", {
      region,
      mode,
      topN,
    });
  };

  const updateScore = () => {
    const socket = socketRef.current;
    if (!socket) return;

    const name = prompt("Enter player name:");
    const score = parseInt(prompt("Enter score:"), 10);

    if (name && !isNaN(score)) {
      socket.emit("updateScore", { name, score, region, mode });
    }
  };

return (
  <div className="container">
    <h1>🏆 Real-Time Leaderboard</h1>

    <div className="controls">
      <label>
        Region :
        <select value={region} onChange={(e) => setRegion(e.target.value)}>
          <option>India</option>
          <option>USA</option>
          <option>Russia</option>
          <option>UK</option>
        </select>
      </label>
      <label>
        Mode :
        <select value={mode} onChange={(e) => setMode(e.target.value)}>
          <option>solo</option>
          <option>duo</option>
          <option>squad</option>
        </select>
      </label>
      <label>
        Top N :
        <input
          type="number"
          value={topN}
          onChange={(e) => setTopN(parseInt(e.target.value, 10) || 1)}
          min="1"
          max="50"
        />
      </label>
      <button onClick={fetchLeaderboard}>🎯 Fetch</button>
      <button onClick={updateScore}>➕ Add Score</button>
    </div>

    <ul className="leaderboard">
      {players.length === 0 ? (
        <div className="empty">No players found.</div>
      ) : (
        players.map((player, index) => {
          const flags = {
            India: "🇮🇳",
            USA: "🇺🇸",
            Russia: "🇷🇺",
            Dubai: "🇦🇪",
            UK: "🇬🇧",
          };
          const medals = ["🥇", "🥈", "🥉"];
          const regionFlag = flags[player.region] || "🌍";
          const badge = medals[index] || "";

          return (
            <li key={index}>
              <div className="info">
                <div className="avatar">{player.name.charAt(0)}</div>
                <div className="name-score">
                  <div className="name">{player.name}</div>
                  <div className="score">{player.score} pts</div>
                </div>
              </div>
              <div className="flag">{regionFlag}</div>
              <div className="badge">{badge}</div>
            </li>
          );
        })
      )}
    </ul>
  </div>
);

}

export default App;
