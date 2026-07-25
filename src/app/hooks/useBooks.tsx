import { useState } from 'react';

interface Book {
  id: string;
  title: string;
  author: string;
  progress: number;
  status: string;
  pages: number;
}

export function useBooks() {
  const [books, setBooks] = useState<Book[]>([]);

  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook: Book = {
      ...book,
      id: Date.now().toString(),
    };
    setBooks([...books, newBook]);
  };

  const updateBook = (id: string, updates: Partial<Book>) => {
    setBooks(books.map(book => book.id === id ? { ...book, ...updates } : book));
  };

  const deleteBook = (id: string) => {
    setBooks(books.filter(book => book.id !== id));
  };

  return {
    books,
    addBook,
    updateBook,
    deleteBook,
  };
}
