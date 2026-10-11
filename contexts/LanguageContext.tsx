'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.reels': 'Reels',
    'nav.movies': 'Movies',
    'nav.music': 'Music',
    'nav.livetv': 'Live TV',
    'nav.series': 'Series',
    'nav.education': 'Education',
    'nav.artists': 'Artists',
    'nav.blogs': 'Area Tory',
    'nav.profile': 'Your profile',
    'nav.favorites': 'Favorites',
    'nav.downloads': 'Downloads',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'nav.login': 'Login',
    'nav.signup': 'Sign Up',

    // Search
    'search.placeholder': 'Search movies, videos, stories...',
    'search.noResults': 'No results found',
    'search.searching': 'Searching...',

    // Movies
    'movies.featured': 'Featured',
    'movies.trending': 'Trending',
    'movies.recommended': 'Recommended for you',
    'movies.continueWatching': 'Continue watching',
    'movies.watchNow': 'Watch now',
    'movies.addToList': 'Add to list',
    'movies.similar': 'Similar titles',
    'movies.episodes': 'Episodes',
    'movies.seasons': 'Seasons',

    // Common
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.retry': 'Retry',
    'common.close': 'Close',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.share': 'Share',
    'common.like': 'Like',
    'common.comment': 'Comment',
    'common.views': 'views',
    'common.likes': 'likes',

    // Stories/Blogs
    'stories.forYou': 'For You',
    'stories.cinema': 'Cinema',
    'stories.music': 'Music',
    'stories.culture': 'Culture',
    'stories.heritage': 'Heritage',
    'stories.tourism': 'Tourism',
    'stories.announcement': 'Announcement',
    'stories.story': 'Story',
    'stories.recently': 'Recently',
    'stories.min': 'min',
    'stories.daysAgo': 'd ago',
    'stories.readMore': 'Read more',
  },
  fr: {
    // Navigation
    'nav.home': 'Accueil',
    'nav.reels': 'Reels',
    'nav.movies': 'Films',
    'nav.music': 'Musique',
    'nav.livetv': 'TV en Direct',
    'nav.series': 'Séries',
    'nav.education': 'Éducation',
    'nav.artists': 'Artistes',
    'nav.blogs': 'Area Tory',
    'nav.profile': 'Votre profil',
    'nav.favorites': 'Favoris',
    'nav.downloads': 'Téléchargements',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Connexion',
    'nav.signup': 'S\'inscrire',

    // Search
    'search.placeholder': 'Rechercher des films, vidéos, histoires...',
    'search.noResults': 'Aucun résultat trouvé',
    'search.searching': 'Recherche en cours...',

    // Movies
    'movies.featured': 'En vedette',
    'movies.trending': 'Tendances',
    'movies.recommended': 'Recommandé pour vous',
    'movies.continueWatching': 'Continuer à regarder',
    'movies.watchNow': 'Regarder maintenant',
    'movies.addToList': 'Ajouter à la liste',
    'movies.similar': 'Titres similaires',
    'movies.episodes': 'Épisodes',
    'movies.seasons': 'Saisons',

    // Common
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.retry': 'Réessayer',
    'common.close': 'Fermer',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.delete': 'Supprimer',
    'common.edit': 'Modifier',
    'common.share': 'Partager',
    'common.like': 'Aimer',
    'common.comment': 'Commenter',
    'common.views': 'vues',
    'common.likes': 'j\'aime',

    // Stories/Blogs
    'stories.forYou': 'Pour Vous',
    'stories.cinema': 'Cinéma',
    'stories.music': 'Musique',
    'stories.culture': 'Culture',
    'stories.heritage': 'Patrimoine',
    'stories.tourism': 'Tourisme',
    'stories.announcement': 'Annonce',
    'stories.story': 'Histoire',
    'stories.recently': 'Récemment',
    'stories.min': 'min',
    'stories.daysAgo': 'j',
    'stories.readMore': 'Lire la suite',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('sawaflix_language') as Language;
    if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'fr')) {
      setLanguageState(savedLanguage);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sawaflix_language', lang);
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
