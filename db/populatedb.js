const { Client } = require('pg');

const SQL = `

CREATE TABLE IF NOT EXISTS Book (
    ID SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    page INT NOT NULL,
    genre VARCHAR(100),
    description TEXT,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS Author (
    ID SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS Book_Author (
    book_id INT REFERENCES Book(ID) ON DELETE CASCADE,
    author_id INT REFERENCES Author(ID) ON DELETE CASCADE,
    PRIMARY KEY (book_id, author_id)
);

INSERT INTO Book (title, page, genre, description, price) VALUES
('The Art of War', 273, 'Strategy', 'An ancient Chinese military treatise', 9.99),
('1984', 328, 'Dystopian', 'A novel by George Orwell about a totalitarian regime', 14.99),
('To Kill a Mockingbird', 281, 'Fiction', 'A novel about racial injustice in the Deep South', 18.50),
('The Great Gatsby', 180, 'Classic', 'A novel about the American dream', 10.99),
('Pride and Prejudice', 279, 'Romance', 'A novel about love and societal expectations', 12.99),
('Moby Dick', 635, 'Adventure', 'A novel about the obsessive quest for a white whale', 15.75),
('War and Peace', 1225, 'Historical', 'A novel that chronicles the history of the French invasion of Russia', 19.99),
('The Catcher in the Rye', 214, 'Fiction', 'A novel about teenage angst and alienation', 13.99),
('Crime and Punishment', 545, 'Philosophical', 'A novel about the moral dilemmas of a poor ex-student', 11.99),
('Brave New World', 268, 'Science Fiction', 'A novel about a dystopian future society', 16.99);

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

INSERT INTO Book_Author (book_id, author_id) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);

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