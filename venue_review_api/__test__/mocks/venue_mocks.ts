let venues_no_filter = [
    { venue_id: '708001fc65af4df19fcba9235c09f439', venue_name: 'Erskine Building', category_id: 'bab967cf41d04f64b05b81c2c5c7637f', city: 'Christchurch', short_description: 'Many a late night has been spent here', latitude: -43.522535, longitude: 172.581086, avg_star_rating: 0, avg_cost_rating: 2, primary_photo: null, distance: 2 },
    { venue_id: 'b043f010284448e382d69571fae06808', venue_name: 'Ilam Gardens', category_id: '2a239543024042259c93a25208acefa3', city: 'Christchurch', short_description: 'Kinda pretty', latitude: -43.524219, longitude: 172.576032, avg_star_rating: 0, avg_cost_rating: 0, primary_photo: 'testing1.jpg', distance: 1 },
    { venue_id: '8b5db9ca7d6f41e398bf551230d7fc23', venue_name: 'The Wok', category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1', city: 'Christchurch', short_description: 'Home of the world-famous $2 rice', latitude: -43.523617, longitude: 172.582885, avg_star_rating: 4.5, avg_cost_rating: 2.5, primary_photo: 'testing1.jpg', distance: 0.5 }
];

let categories = [
    { category_id: 'bab967cf41d04f64b05b81c2c5c7637f', category_name: 'Accommodation', category_description: 'The best places to stay in town.' },
    { category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1', category_name: 'Cafés & Restaurants', category_description: 'The finest dining in town.' },
    { category_id: '6dedf452f7f040c1808d0790a65c2d3c', category_name: 'Attractions', category_description: 'The best things to see in town.' },
    { category_id: '59a73e0920f54379b46db601731a92f9', category_name: 'Events', category_description: 'Whats going on in town.' },
    { category_id: '2a239543024042259c93a25208acefa3', category_name: 'Nature Spots', category_description: 'The most beautiful bits of nature in town.' },
]

let venue_by_id = {
    venue_name: 'The Wok',
    admin_id: 'c48a5cfd48b94ac68787a3776d6ae78d', username: 'bobby1',
    category_id: 'b8c3bfc4ee5d42b7ab4b3eac6aaa3ae1', category_name: 'Cafés & Restaurants', category_description: 'The finest dining in town.',
    city: 'Christchurch', short_description: 'Home of the world-famous $2 rice', long_description: '', date_added: new Date('2021-08-01T00:00:00.000Z'), address: '123 Riccarton Road', latitude: -43.523617, longitude: 172.582885, photos: 'testing1.jpg^test1_desc^1[]testing2.jpg^test2_desc^0[]testing3.jpg^test3^0'
}

export { categories, venue_by_id, venues_no_filter };

