# Database Configuration (For Docker Use)

1. Get the docker image for mysql, probably latest. `[sudo] docker pull mysql`
2. Start the docker container.
   ```
   docker run \
       --detach \
       --name=[container_name] \
       --env="MYSQL_ROOT_PASSWORD=[password]" \
       --publish 3306:3306 \
       --restart unless-stopped \
       --volume=/var/lib/mysql \
       mysql
   ```
   `--detach` is telling the docker command not to attach itself to the terminal, so we can close the console or run further commands after.<br />
   `--name=[container_name]` is specifying a friendly name to reference the container by. Replace `[container_name]` with the name you choose. In my case, and going forward on this readme, I will use `mysql`.<br />
   `--env="MYSQL_ROOT_PASSWORD=[password]"` is specifying the root password for initial startup. Replace `[password]` with the password you wish to use for root on your db server. If this is ommited, a password will be generated and will be in the docker logs for the run, you will have to find it. Docker windows lets you click the image, which shows the initial logs and hence the password along with it. In following steps, I will use `password` as this value.<br />
   `--publish 3306:3306` is exposing the ports the image will run on. The left hand side is the port you will request on, and the right hand side is the port it is forwarded too. To keep it simple, using the same, mysql deafult port is best.<br />
   `--restart unless-stopped` is defining the container behaviour when the server restarts. Without this, you will have to SSH into your server manually to restart the container<br />
   `--volume=/var/lib/mysql` is defining a storage location to persist the database data. Without this, the container cannot be removed, and if it is, then restarted, no data will be saved.
3. Access the docker image<br />
   `docker exec -it mysql bash`
4. Access the mysql server running on that docker container
   `mysql -uroot -ppassword`
5. You should now be logged into the mysql server and have the capability to run commands such as `show databases;` as an example.
6. Create a new database for the project<br />
   `create database venue_review;`
7. Create a new user<br />
   `create user 'venue_review'@'%' identified by 'password';`
8. Assign the new user permissions to access the database<br />
   `grant all privileges on venue_review.* to 'venue_review'@'%';`<br />
   In the interest of space and time, I grant all privileges to all tables in the venue-review table. In a real situation, specifying a list of grants is much more secure and safe. Up to you to research.<br />
   - An example with more fine grained permissions could be as such, and what I use on my public databases with mysql:<br />
     `grant select,insert,alter,delete,create,references,update on venue_review.* to 'venue_review'@'%';`
   - For a test user, this might also include `index`, `drop`, etc. so you have some extra functionality.
9. Run the command `flush privileges;` to finalise the permission process. Without this command, the permissions will not be applied.
10. `quit` out of mysql, and follow the same access command from step 4, with the new username and password. The username does not need the host (`@'[host]`)

## Resources

1. https://dev.mysql.com/blog-archive/how-to-grant-privileges-to-users-in-mysql-80/ -> Permissions
2. https://phoenixnap.com/kb/mysql-docker-container -> Setup
   <br />
   <br />

# .env Configuration for application

There are only 4 properties that need to be set here, all of which are then placed into the db init code when creating the pool. These properties go into a file named `.production.env`.

```
MYSQL_HOST={server}
MYSQL_USER={username}
MYSQL_PASSWORD={password}
MYSQL_DATABASE={database}
```

`{server}` is the host, essentially. If you are running from a docker container on your current machine, this value will be `localhost` or `127.0.0.1`<br />
`{username}` and `{passowrd}` don't need explaining. This is the credentials for the user accessing the database, likely the one made in step 7 of database configuration process. In my case, `{username} -> node, {password} -> password`<br />
`{database}` is the database we are accessing, and likely the one created in step 6 of the database configuration process. In my case, `venue_review`<br />
An example might look as such:

```
MYSQL_HOST=127.0.0.1
MYSQL_USER=node
MYSQL_PASSWORD=password
MYSQL_DATABASE=venue_review
```

<br />
<br />

# Running the application locally

### DEBUG (Live refresh on code changes)

1. Use `npm install` to install all of the required node_modules to run the application
2. Use `npm run dev` and watch the magic happen.
3. The server will be accessible on localhost:5000

### BUILD (No refresh on code changes)

1. Use `npm install` to install all of the required node_modules to run the application
2. Use `npm run build` to compile all of the typescript files into javascript, which node is able to run directly.
3. Use `npm run start` to server the files that were built in the previous step.
4. The server will be accessible on localhost:5000
   <br />
   <br />

# Testing

## Configure database

First things first, we need a database to run tests on.

1. Follow any necessary steps from the database configuration process. You likely already have the docker image up and running, so following from creating a new database and user is fine for this process. Technically, you could run this on your main database, but it will delete all tables and rebuild the database with sample data.

## .env Configuration

We also need some custom env variables set, in a special test version of the file.

1. This is the same as the .env Configuration from above, except the file needs to be called `.test.env` in this case. If you wish to use a different env file, make sure to edit `pretest.config.ts` to specify said env file.
2. If you use a database name different to `venue_review_test` as I do for my testing, make sure to update the sql files to match this, so the scripts run correctly on the right database.

## Running

1. Run `npm run test` and let jest and any configuration do it's thing.
