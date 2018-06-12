var gulp = require('gulp'),
    pkg = require('./package.json');

var aws = require('gulp-awspublish'),
    connect = require('gulp-connect'),
    rename = require('gulp-rename');

// FIXME: move this to npm if possible
gulp.task('serve', function () {
  return connect.server({
    root: [__dirname, 'dist'],
    port: 8000
  });
});

gulp.task('deploy', function() {

  if (!process.env.AWS_KEY || !process.env.AWS_SECRET) {
    throw 'AWS credentials are required!';
  }

  var publisher = aws.create({
    key: process.env.AWS_KEY,
    secret: process.env.AWS_SECRET,
    bucket: 'prodperfect-keen-js', // pkg.name
    endpoint: 's3.us-east-2.amazonaws.com',
    region: 'us-east-2'
  });

  var cacheLife = (1000 * 60 * 60 * 24 * 365); // 1 year

  var headers = {
    // Cache policy (1000 * 60 * 60 * 1) // 1 hour
    // 'Cache-Control': 'max-age=3600000, public',
    // 'Expires': new Date(Date.now() + 3600000).toUTCString()
    'Cache-Control': 'max-age=' + cacheLife + ', public',
    'Expires': new Date(Date.now() + cacheLife).toUTCString()
  };

  return gulp.src([
      './dist/keen-tracking.js',
      './dist/keen-tracking.min.js'
    ])
    .pipe(rename(function(path) {
      path.dirname += '/';
      var name = pkg.name + '-' + pkg.version;
      path.basename = (path.basename.indexOf('min') > -1) ? name + '.min' : name;
    }))
    .pipe(aws.gzip())
    .pipe(publisher.publish(headers, { force: true }))
    .pipe(publisher.cache())
    .pipe(aws.reporter());

});
