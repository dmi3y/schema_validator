var
    gulp = require('gulp'),
    concat = require('gulp-concat'),
    rename = require('gulp-rename'),
    path = require('path'),
    replace = require('gulp-replace'),
    sourcemaps = require('gulp-sourcemaps'),
    config = require(__dirname + '/schema_validator.rc.js'),
    grabSchemas = require(__dirname + '/script/schemasGrabber.js'),
    prepareFlist = require(__dirname + '/script/prepareFlist.js'),
    config = require(__dirname + '/schema_validator.rc.js'),
    schemaSrc = path.resolve(config.schemaSrc) + '/*.json',
    del = require('del');

gulp.task('script', ['clr'], function() {

    return gulp.src([
        'bower_components/jquery/dist/jquery.js',
        'bower_components/fuse.js/src/fuse.js',
        'bower_components/json-tree-ts/jsontree.js',
        'client_src/customForm.js'
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('all.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('client_build'));
});

gulp.task('style', ['clr'], function() {

    return gulp.src([
        'bower_components/json-tree-ts/css/jsontree.css',
        'client_src/customForm.css'
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('all.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest('client_build'));
});

gulp.task('client', ['clr'], function() {
    var
        baseUrl = 'http://' + config.ip + ':' + config.port + '/';

    return gulp.src(['client_src/jsonSchemaValidator.js'])
        .pipe(replace(/{{<<baseUrl>>}}/g, baseUrl))
        .pipe(gulp.dest('client_build'));
});

gulp.task('html', ['clr', 'schemas'], function() {

    return gulp.src(['client_src/customForm.html'])
        .pipe(replace(/{{mailto}}/g, config.mailto))
        .pipe(replace(/{{flist}}/g, prepareFlist))
        .pipe(gulp.dest('client_build'));
});

gulp.task('schemas', ['clr'], function() {

    return gulp.src([schemaSrc])
        .pipe(grabSchemas())
        .pipe(rename(function (path) {
            path.basename = path.basename.toLowerCase();
            path.extname = "";
        }))
        .pipe(gulp.dest('schemas'));
});

gulp.task('clr', function(cb) {

    del(['client_build', 'schemas'], cb);
});

gulp.task('watch', function() {
  gulp.watch('client_src/*', ['build']);
});

gulp.task('build', ['script', 'style', 'client', 'html']);
