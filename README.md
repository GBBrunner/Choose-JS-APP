---------- CREDITS ----------
This was made made by Chase Olsen and Garrett Brunner
---------- HOW TO USE ----------
For proper functioality you will need to create a 'env.js' and place it in the scripts folder, this is where you'll place the API Access key.
Your file should look like 
export const API_ACCESS_TOKEN = 'insert-your-themoviedb.org-API-Access-key-here'

This project uses Vite, Tailwind, and Jasmine for testing. Make sure you run npm install for functionality.

---------- CAROUSEL FUNCTIONALITY ----------
The movie carousels render in tiles based on the size of the screen and the preset tile size and calculates how many can fit. So the tiles themselves won't ever change size, just the amount of tiles will be adjusted, while still having the carousel scroll as intended. Using the search bar in the header will make all the previous carousels stop displaying and it will show the results of the query 