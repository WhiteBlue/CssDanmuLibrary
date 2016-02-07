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

gulp.task('css', function () {
    gulp.src('src/css/*.css')
        .pipe(concat('main.css'))
        .pipe(cssnano())
        .pipe(gulp.dest('dest/css'))
});

gulp.task('watchcss', function () {
    return gulp.watch('src/css/*.css', ['css']);
});

gulp.task('watchjs', function () {
    return gulp.watch('src/*.js', ['js']);
});

gulp.task('default', ['clean', 'js', 'css']);

gulp.task('watch', ['clean', 'default', 'watchjs', 'watchcss']);





