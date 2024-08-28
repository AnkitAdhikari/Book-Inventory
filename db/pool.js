const { Pool } = require('pg');

module.exports = new Pool({
    connectionString: "postgresql://ankit:ankit@psql@localhost:5432/book_inventory"
});