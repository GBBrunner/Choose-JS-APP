
## This was made made by Chase Olsen and Garrett Brunner
## ---------- HOW TO USE ----------
For proper functioality you will need to create a 'env.js' and place it in the scripts folder, this is where you'll place the API Access key.
Your file should look like 
```js
export const API_ACCESS_TOKEN = 'insert-your-themoviedb.org-API-Access-key-here'
```

This project uses Vite, Tailwind, and Jasmine for testing. 
Make sure you run 'npm install' for functionality.

## ---------- HEADER ----------
Header will be the same and functional on each and every page. This is done dynmically in JavaScript.
- In the Header will be the title that links back to index.html
- a favorites link, going to the user's favorites page
- A login/signp/users link - If not signed in it will take them to a page to either sign in or create account.
- It will change to a User page link if there is someone signed in

## ---------- CAROUSEL FUNCTIONALITY ----------
The movie carousels render in tiles based on the size of the screen and the preset tile size and calculates how many can fit. So the tiles themselves won't ever change size, just the amount of tiles will be adjusted, while still having the carousel scroll as intended. Using the search bar in the header will make all the previous carousels stop displaying and it will show the results of the query 

## ---------- TITLE DETAILS PAGE ----------
Clicking on any title result it going to a seperate title details page.
Displayed there will be all the relevant information on the title. (i.e., Title, Videos, Rating, Length, etc ...)

## ---------- LOG IN/SIGN UP PAGE ----------
- The sign up page uses local stoage for demonstation purposes, in a real application an online data system to store data.
- It won't let you create a new account if one already exists under the same name. (i.e., you can't create account abc123 if there is one that exists already)
- On Login page it won't let you log in if password does not match user.
- Once logged in it will redirect you to index.html and say "hello,<user>" instead of Log In/SignUp

## ---------- FAVORITES PAGE ----------
- Once there is an account signed in it will let the user put titles on their favorites list.
- Favorites list can be seen on it's own carousel on a seperate page that you can navigate to in the header.
- If there is no account signed in, instead of adding to favorites list it will simply alert a message asking to sign in first. On the favorites page, if there is no account signed-in it will display a message prompting the user to sign in
