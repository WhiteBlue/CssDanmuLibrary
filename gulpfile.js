var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var jshint = require('gulp-jshint');
var cssnano = require('gulp-cssnano');
var clean = require('gulp-clean');


gulp.task('clean', function () {
    gulp.src('dest/js/*.js', {read: false})
        .pipe(clean());
    gulp.src('dest/css/*.css', {read: false})
        .pipe(clean());
});

gulp.task('js', function () {
    gulp.src('src/*.js')
        .pipe(uglify())
        .pipe(jshint())
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dest/js'))
});


gulp.task('debug', function () {
    gulp.src('src/*.js')
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dest/js'));
    gulp.src('src/css/*.css')
        .pipe(concat('main.css'))
        .pipe(gulp.dest('dest/css'));
});

gulp.task('css', function () {
    gulp.src('src/css/*.css')
        .pipe(concat('main.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('dest/css'))
});

gulp.task('watchcss', function () {
    return gulp.watch('src/css/*.css', ['debug']);
});

gulp.task('concat_ccl', function () {
    gulp.src('src_ccl/*.js')
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dest_ccl/js'));
    gulp.src('src_ccl/css/*.css')
        .pipe(concat('main.css'))
        .pipe(gulp.dest('dest_ccl/css'));
});

gulp.task('watchjs', function () {
    return gulp.watch('src/*.js', ['debug']);
});

gulp.task('default', ['clean', 'js', 'css']);

gulp.task('watch', ['clean', 'debug', 'watchjs', 'watchcss']);

gulp.task('debug_ccl', ['clean', 'concat_ccl']);
