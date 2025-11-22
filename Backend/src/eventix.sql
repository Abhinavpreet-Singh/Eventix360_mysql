use eventix;
show tables;

CREATE TABLE users (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    user_name VARCHAR(100) NOT NULL, 
    user_email VARCHAR(120) UNIQUE NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_phone CHAR(10) NOT NULL CHECK (user_phone REGEXP '^[0-9]{10}$'),
    department VARCHAR(100),
    year_of_study TINYINT NOT NULL CHECK (year_of_study BETWEEN 1 AND 4),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE clubs (
    club_id INT PRIMARY KEY AUTO_INCREMENT,
    club_name VARCHAR(100) UNIQUE NOT NULL,
    club_email VARCHAR(120) UNIQUE NOT NULL,
    club_password VARCHAR(255) NOT NULL,
    club_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE super_admins (
    admin_id INT PRIMARY KEY AUTO_INCREMENT,
    admin_name VARCHAR(100) NOT NULL,
    admin_email VARCHAR(120) UNIQUE NOT NULL,
    admin_password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    category_id INT PRIMARY KEY AUTO_INCREMENT,
    category_name VARCHAR(100) UNIQUE NOT NULL,
    category_description TEXT
);

CREATE TABLE event_cards (
    event_id INT PRIMARY KEY AUTO_INCREMENT,
    event_title VARCHAR(100) NOT NULL,
    event_date DATE NOT NULL,
    event_location VARCHAR(100) NOT NULL,
    image_url VARCHAR(255),
    club_id INT NOT NULL,
    category_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES clubs(club_id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

CREATE TABLE event_details (
    event_id INT PRIMARY KEY,
    event_description TEXT NOT NULL,
    brochure_url VARCHAR(255),
    event_schedule TEXT,
    terms TEXT,
    FOREIGN KEY (event_id) REFERENCES event_cards(event_id) ON DELETE CASCADE
);


CREATE TABLE registrations (
    registration_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    registration_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    confirmation_code CHAR(36) DEFAULT (UUID()) UNIQUE,
    FOREIGN KEY (event_id) REFERENCES event_cards(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);


CREATE TABLE feedbacks (
    feedback_id INT PRIMARY KEY AUTO_INCREMENT,
    event_id INT NOT NULL,
    user_id INT NOT NULL,
    rating TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comments TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (event_id) REFERENCES event_cards(event_id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

CREATE TABLE payments (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    registration_id INT NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_status ENUM('SUCCESS', 'FAILED', 'PENDING') NOT NULL,
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (registration_id) REFERENCES registrations(registration_id) ON DELETE CASCADE
);

CREATE TABLE event_logs (
    log_id INT PRIMARY KEY AUTO_INCREMENT,
    action_type VARCHAR(50),
    description TEXT,
    action_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);






