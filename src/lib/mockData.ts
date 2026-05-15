import { Verse } from './constants';

export const MOCK_VERSES: Verse[] = [
  // John 1:1-5 (English NIV)
  {
    id: 'john-1-1-niv', testament: 'NT', bookId: 'john', bookName: 'John', chapter: 1, verse: 1,
    translation: 'NIV', language: 'en', text: 'In the beginning was the Word, and the Word was with God, and the Word was God.',
    keywords: ['beginning', 'word', 'god'], crossReferences: ['gen-1-1']
  },
  {
    id: 'john-1-2-niv', testament: 'NT', bookId: 'john', bookName: 'John', chapter: 1, verse: 2,
    translation: 'NIV', language: 'en', text: 'He was with God in the beginning.',
    keywords: ['beginning', 'god']
  },
  {
    id: 'john-1-3-niv', testament: 'NT', bookId: 'john', bookName: 'John', chapter: 1, verse: 3,
    translation: 'NIV', language: 'en', text: 'Through him all things were made; without him nothing was made that has been made.',
    keywords: ['creation', 'everything']
  },
  {
    id: 'john-1-4-niv', testament: 'NT', bookId: 'john', bookName: 'John', chapter: 1, verse: 4,
    translation: 'NIV', language: 'en', text: 'In him was life, and that life was the light of all mankind.',
    keywords: ['life', 'light']
  },
  {
    id: 'john-1-5-niv', testament: 'NT', bookId: 'john', bookName: 'John', chapter: 1, verse: 5,
    translation: 'NIV', language: 'en', text: 'The light shines in the darkness, and the darkness has not overcome it.',
    keywords: ['light', 'darkness']
  },

  // John 1:1-5 (Indonesian TB)
  {
    id: 'john-1-1-tb', testament: 'NT', bookId: 'john', bookName: 'Yohanes', chapter: 1, verse: 1,
    translation: 'TB', language: 'id', text: 'Pada mulanya adalah Firman; Firman itu bersama-sama dengan Allah dan Firman itu adalah Allah.',
    keywords: ['mula', 'firman', 'allah'], crossReferences: ['kej-1-1']
  },
  {
    id: 'john-1-2-tb', testament: 'NT', bookId: 'john', bookName: 'Yohanes', chapter: 1, verse: 2,
    translation: 'TB', language: 'id', text: 'Ia pada mulanya bersama-sama dengan Allah.',
    keywords: ['mula', 'allah']
  },
  {
    id: 'john-1-3-tb', testament: 'NT', bookId: 'john', bookName: 'Yohanes', chapter: 1, verse: 3,
    translation: 'TB', language: 'id', text: 'Segala sesuatu dijadikan oleh Dia dan tanpa Dia tidak ada suatu pun yang telah jadi dari segala yang telah dijadikan.',
    keywords: ['penciptaan', 'segala']
  },
  {
    id: 'john-1-4-tb', testament: 'NT', bookId: 'john', bookName: 'Yohanes', chapter: 1, verse: 4,
    translation: 'TB', language: 'id', text: 'Dalam Dia ada hidup dan hidup itu adalah terang manusia.',
    keywords: ['hidup', 'terang']
  },
  {
    id: 'john-1-5-tb', testament: 'NT', bookId: 'john', bookName: 'Yohanes', chapter: 1, verse: 5,
    translation: 'TB', language: 'id', text: 'Terang itu bercahaya di dalam kegelapan dan kegelapan itu tidak menguasainya.',
    keywords: ['terang', 'gelap']
  },

  // Romans 8:28 (English NIV)
  {
    id: 'romans-8-28-niv', testament: 'NT', bookId: 'romans', bookName: 'Romans', chapter: 8, verse: 28,
    translation: 'NIV', language: 'en', text: 'And we know that in all things God works for the good of those who love him, who have been called according to his purpose.',
    keywords: ['good', 'love', 'purpose']
  },
  // Romans 8:28 (Indonesian TB)
  {
    id: 'romans-8-28-tb', testament: 'NT', bookId: 'romans', bookName: 'Roma', chapter: 8, verse: 28,
    translation: 'TB', language: 'id', text: 'Kita tahu sekarang, bahwa Allah turut bekerja dalam segala sesuatu untuk mendatangkan kebaikan bagi mereka yang mengasihi Dia, yaitu bagi mereka yang terpanggil sesuai dengan rencana Allah.',
    keywords: ['baik', 'kasih', 'rencana']
  }
];

export function getVersesByChapter(bookId: string, chapter: number, translation: string): Verse[] {
  return MOCK_VERSES.filter(v => v.bookId === bookId && v.chapter === chapter && v.translation === translation);
}

export function searchVerses(query: string): Verse[] {
  const q = query.toLowerCase();
  return MOCK_VERSES.filter(v => 
    v.text.toLowerCase().includes(q) || 
    v.bookName.toLowerCase().includes(q) ||
    v.keywords?.some(k => k.toLowerCase().includes(q))
  );
}
