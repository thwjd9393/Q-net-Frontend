import {defineConfig} from 'vite';

export default defineConfig({
  base: './',
  build: {
    rollupOptions: {
      input: {
        index: 'index.html',
        home: 'home.html',
        login: 'login.html',
        profile: 'profile.html',
        related: 'related.html',
        recommendations: 'recommendations.html',
        detail: 'detail.html',
        mypage: 'mypage.html',
        favorites: 'favorites.html',
        calendar: 'calendar.html',
        'calendar-callback': 'calendar-callback.html',
        callback: 'callback.html',
      },
    },
  },
});
