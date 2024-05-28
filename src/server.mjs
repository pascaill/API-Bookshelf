import { server as _server } from '@hapi/hapi';
import { nanoid } from 'nanoid';

const books = [];

const init = async () => {
    const server = _server({
        port: 9000,
        host: 'localhost'
    });

    // Route untuk menambah buku
    server.route({
        method: 'POST',
        path: '/books',
        handler: (request, h) => {
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

            if (!name) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. Mohon isi nama buku'
                }).code(400);
            }

            if (readPage > pageCount) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount'
                }).code(400);
            }

            const id = nanoid(16);
            const insertedAt = new Date().toISOString();
            const updatedAt = insertedAt;
            const finished = pageCount === readPage;

            const newBook = {
                id, name, year, author, summary, publisher,
                pageCount, readPage, finished, reading, insertedAt, updatedAt
            };
            books.push(newBook);

            return h.response({
                status: 'success',
                message: 'Buku berhasil ditambahkan',
                data: {
                    bookId: id
                }
            }).code(201);
        }
    });

    // Route untuk menampilkan semua buku
    server.route({
        method: 'GET',
        path: '/books',
        handler: () => ({
            status: 'success',
            data: {
                books: books.map(({ id, name, publisher }) => ({ id, name, publisher }))
            }
        })
    });

    // Route untuk menampilkan detail buku
    server.route({
        method: 'GET',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const { bookId } = request.params;
            const book = books.find((b) => b.id === bookId);

            if (!book) {
                return h.response({
                    status: 'fail',
                    message: 'Buku tidak ditemukan'
                }).code(404);
            }

            return {
                status: 'success',
                data: { book }
            };
        }
    });

    // Route untuk mengubah data buku
    server.route({
        method: 'PUT',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const { bookId } = request.params;
            const { name, year, author, summary, publisher, pageCount, readPage, reading } = request.payload;

            const index = books.findIndex((b) => b.id === bookId);

            if (index === -1) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Id tidak ditemukan'
                }).code(404);
            }

            if (!name) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. Mohon isi nama buku'
                }).code(400);
            }

            if (readPage > pageCount) {
                return h.response({
                    status: 'fail',
                    message: 'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount'
                }).code(400);
            }

            const updatedAt = new Date().toISOString();
            books[index] = {
                ...books[index],
                name, year, author, summary, publisher, pageCount, readPage, reading,
                finished: pageCount === readPage, updatedAt
            };

            return {
                status: 'success',
                message: 'Buku berhasil diperbarui'
            };
        }
    });

    // Route untuk menghapus buku
    server.route({
        method: 'DELETE',
        path: '/books/{bookId}',
        handler: (request, h) => {
            const { bookId } = request.params;
            const index = books.findIndex((b) => b.id === bookId);

            if (index === -1) {
                return h.response({
                    status: 'fail',
                    message: 'Buku gagal dihapus. Id tidak ditemukan'
                }).code(404);
            }

            books.splice(index, 1);
            return {
                status: 'success',
                message: 'Buku berhasil dihapus'
            };
        }
    });

    await server.start();
    console.log('Server berjalan pada %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
