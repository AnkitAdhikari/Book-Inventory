const { Client } = require('pg');

const SQL = `

CREATE TABLE IF NOT EXISTS Book (
    ID SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    page INT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS Author (
    ID SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Genre (
    ID SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS Book_Author (
    book_id INT REFERENCES Book(ID) ON DELETE CASCADE,
    author_id INT REFERENCES Author(ID) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

CREATE TABLE IF NOT EXISTS Book_Genre (
    book_id INT REFERENCES Book(ID) ON DELETE CASCADE,
    genre_id INT REFERENCES Genre(ID) ON DELETE CASCADE,
    PRIMARY KEY (book_id, genre_id)
);


-- Insert data into the Book table
INSERT INTO Book (title, page, description, price) VALUES
('The Art of War', 273, 'An ancient Chinese military treatise', 9.99),
('1984', 328, 'A novel by George Orwell about a totalitarian regime', 14.99),
('To Kill a Mockingbird', 281, 'A novel about racial injustice in the Deep South', 18.50),
('The Great Gatsby', 180, 'A novel about the American dream', 10.99),
('Pride and Prejudice', 279, 'A novel about love and societal expectations', 12.99),
('Moby Dick', 635, 'A novel about the obsessive quest for a white whale', 15.75),
('War and Peace', 1225, 'A novel that chronicles the history of the French invasion of Russia', 19.99),
('The Catcher in the Rye', 214, 'A novel about teenage angst and alienation', 13.99),
('Crime and Punishment', 545, 'A novel about the moral dilemmas of a poor ex-student', 11.99),
('Brave New World', 268, 'A novel about a dystopian future society', 16.99);

-- Insert data into the Author table
INSERT INTO Author (name) VALUES
('Sun Tzu'),
('George Orwell'),
('Harper Lee'),
('F. Scott Fitzgerald'),
('Jane Austen'),
('Herman Melville'),
('Leo Tolstoy'),
('J.D. Salinger'),
('Fyodor Dostoevsky'),
('Aldous Huxley');

-- Insert data into the Genre table
INSERT INTO Genre (name) VALUES
('Strategy'),
('Dystopian'),
('Fiction'),
('Classic'),
('Romance'),
('Adventure'),
('Historical'),
('Science Fiction'),
('Philosophical');

-- Insert data into the Book_Author table
INSERT INTO Book_Author (book_id, author_id) VALUES
(1, 1),  -- The Art of War -> Sun Tzu
(2, 2),  -- 1984 -> George Orwell
(3, 3),  -- To Kill a Mockingbird -> Harper Lee
(4, 4),  -- The Great Gatsby -> F. Scott Fitzgerald
(5, 5),  -- Pride and Prejudice -> Jane Austen
(6, 6),  -- Moby Dick -> Herman Melville
(7, 7),  -- War and Peace -> Leo Tolstoy
(8, 8),  -- The Catcher in the Rye -> J.D. Salinger
(9, 9),  -- Crime and Punishment -> Fyodor Dostoevsky
(10, 10); -- Brave New World -> Aldous Huxley

-- Insert data into the Book_Genre table
INSERT INTO Book_Genre (book_id, genre_id) VALUES
(1, 1),  -- The Art of War -> Strategy
(2, 2),  -- 1984 -> Dystopian
(3, 3),  -- To Kill a Mockingbird -> Fiction
(4, 4),  -- The Great Gatsby -> Classic
(5, 5),  -- Pride and Prejudice -> Romance
(6, 6),  -- Moby Dick -> Adventure
(7, 7),  -- War and Peace -> Historical
(8, 3),  -- The Catcher in the Rye -> Fiction
(9, 9),  -- Crime and Punishment -> Philosophical
(10, 8); -- Brave New World -> Science Fiction


`

async function main() {
    console.log("Seeding.....");
    const client = new Client({
        connectionString: "postgresql://ankit:ankit@psql@localhost:5432/book_inventory"
    });
    await client.connect();
    await client.query(SQL);
    await client.end();
    console.log("done, table created");
}

main();