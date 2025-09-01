-- Initialize Billion Rows Challenge Tournament Database

-- Create tables
CREATE TABLE IF NOT EXISTS submissions (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    repository VARCHAR(200) NOT NULL,
    pr_number INTEGER,
    language VARCHAR(50) NOT NULL,
    execution_time DECIMAL(10,3),
    performance_level VARCHAR(50),
    security_status VARCHAR(50),
    violations INTEGER DEFAULT 0,
    warnings INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS results (
    id SERIAL PRIMARY KEY,
    submission_id INTEGER REFERENCES submissions(id),
    test_case VARCHAR(100),
    result_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS leaderboard (
    id SERIAL PRIMARY KEY,
    user_name VARCHAR(100) NOT NULL,
    best_time DECIMAL(10,3),
    language VARCHAR(50),
    rank_position INTEGER,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user ON submissions(user_name);
CREATE INDEX IF NOT EXISTS idx_submissions_language ON submissions(language);
CREATE INDEX IF NOT EXISTS idx_submissions_time ON submissions(execution_time);
CREATE INDEX IF NOT EXISTS idx_leaderboard_rank ON leaderboard(rank_position);

-- Insert sample data
INSERT INTO submissions (user_name, repository, language, execution_time, performance_level, security_status) VALUES
('demo_user', 'demo/billion-rows', 'python', 8.45, 'advanced', 'success'),
('test_user', 'test/optimization', 'cpp', 5.23, 'expert', 'success'),
('sample_user', 'sample/challenge', 'java', 12.67, 'intermediate', 'success')
ON CONFLICT DO NOTHING;

-- Create views
CREATE OR REPLACE VIEW top_performers AS
SELECT 
    user_name,
    language,
    MIN(execution_time) as best_time,
    performance_level
FROM submissions 
WHERE security_status = 'success'
GROUP BY user_name, language, performance_level
ORDER BY best_time ASC;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO tournament;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO tournament;


