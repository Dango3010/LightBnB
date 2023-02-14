# LightBnB Project

LightBnB is a web application built by Node and psql database where users can get all information of any available properties for staying over a period of time during vacations anywhere in the world and make their own listings.

## Final Product

Home page after logged in:
!["Screenshot1"](https://user-images.githubusercontent.com/114049732/215362411-ab545bf0-c71d-4485-964c-c129e4be2b2a.png)


Register page:
!["Screenshot2"](https://user-images.githubusercontent.com/114049732/215362448-49c01b0f-5820-40be-b8b1-98b309338081.png)


Filter out places for your own comfort:
!["Screenshot3"](https://user-images.githubusercontent.com/114049732/215362466-0cdef77a-1bb7-405d-a742-47cb0872090b.png)



## Dependencies

- Node.js
- bcryptjs
- cookie-session
- body-parser
- Express
- Nodemon
- Pg

## Getting Started
- create tables in your database by running 01_schema.sql file (in migrations folder), and insert rows into the tables by running 01_seeds.sql and 02_seeds.sql files (in seeds folder)
- Install all dependencies (using the `npm install` command).
- Run the development web server using the `npm run local` command.
