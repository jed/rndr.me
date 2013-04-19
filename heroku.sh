# Create a place for your renderer to live
mkdir my_renderer
cd my_renderer

# Create a git repo with rndr.me and a Procfile
git init
git submodule add git://github.com/jed/rndr.me.git
echo "web: phantomjs rndr/server.js" > Procfile

# Create a new Heroku app with the PhantomJS buildpack
heroku apps:create
heroku config:add BUILDPACK_URL=http://github.com/stomita/heroku-buildpack-phantomjs.git

# Push your code
git add .
git commit -m "first commit"
git push heroku master

# Scale your app
heroku ps:scale web=1
