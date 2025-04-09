import { useState } from "react";
import RepoList from "./components/RepoList";
import CommitsChart from "./components/CommitsChart";
import DailyCommitsChart from "./components/DailyCommitsChart";
import "./components/styles.css";

function App() {
  const [username, setUsername] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (username.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <div className="card-header">
          <h1 className="card-title">GitHub Repository Explorer</h1>
        </div>
        <div className="card-content">
          <form onSubmit={handleSubmit} className="search-form">
            <div className="input-group">
              <input
                type="text"
                className="input"
                placeholder="Enter GitHub username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
              <button type="submit" className="button">
                Analyze
              </button>
            </div>
          </form>
        </div>
      </div>

      {submitted && username && (
        <div className="results-container">
          <div className="results-grid">
            <RepoList username={username} />
            <CommitsChart username={username} />
          </div>
          <div className="daily-commits-container">
            <DailyCommitsChart username={username} />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
