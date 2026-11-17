-- OPTIONAL: sample books so the dashboard isn't empty. Run AFTER the server has started once.
USE library_db;
INSERT INTO books (title, author, genre, isbn, quantity) VALUES
('Things Fall Apart', 'Chinua Achebe', 'Fiction', '9780385474542', 5),
('Mhudi', 'Sol Plaatje', 'Historical Fiction', '9780894106118', 1),
('Clean Code', 'Robert C. Martin', 'Technology', '9780132350884', 3),
('Learning React', 'Alex Banks', 'Technology', '9781492051725', 0),
('The Alchemist', 'Paulo Coelho', 'Fiction', '9780062315007', 4);
