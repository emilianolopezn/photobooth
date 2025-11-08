import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.js',
    ],

    theme: {
        extend: {
            colors: {
                terracotta: '#C86B5A',
                beige: '#EADAC1',
                sage: '#9BAE93',
                cream: '#FAF6F1',
                brown: '#8C6A5D',
                'boho-brown': '#8C6A5D',
            },
            fontFamily: {
                sans: ['"DM Sans"', ...defaultTheme.fontFamily.sans],
            },
            boxShadow: {
                soft: '0 15px 40px rgba(140, 106, 93, 0.15)',
            },
        },
    },

    plugins: [forms],
};
