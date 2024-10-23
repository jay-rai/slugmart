#### Slugmart Readme

First things first is to git clone the repository, make sure you have the ssh keys setup before hand and run the following command
```
git clone git@github.com:jay-rai/slugmart.git
```

Once you downloaded the repository you'll notice that the project will not have the .env, this was in the .gitignore, in order to keep our secret keys safe they will be found in our discord. Please make sure to include this in the main project folder, not the source folder

**Npm Dependencies**
In order to install the dependencies we have for our system just run the following command
```
npm install
```
This should install the following packages we are using
```
react-router-dom     # used for our basic page routing
firebase             # used for our backend databse, oauth
firebase-tools       # used for backend services, connecting us to gcloud
fontawesome          # free icons for us to use yay


... more to be added
```

