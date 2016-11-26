var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var cssnano = require('gulp-cssnano');
var clean = require('gulp-clean');
var runSequence = require('run-sequence');

var browserify = require('browserify');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var babelify = require('babelify');

const paths = {
    bundleJs: 'danmu-library.js',
    bundleCss: 'danmu-library.css',
    entry: 'src/js/CommentManager.js',
    srcCss: 'src/styles/*.css',
    distCss: 'dist/css',
    distJs: 'dist/js'
};


gulp.task('browserify', function () {
    var debug = (process.env.NODE_ENV == "debug");
    browserify(paths.entry, {debug: debug})
        .transform(babelify)
        .bundle()
        .pipe(source(paths.bundleJs))
        .pipe(buffer())
        .pipe(uglify())
        .pipe(gulp.dest(paths.distJs));
});

gulp.task('clean', function () {
    gulp.src(paths.distJs, {read: false})
        .pipe(clean());
    gulp.src(paths.distCss, {read: false})
        .pipe(clean());
});


gulp.task('styles', function () {
    gulp.src(paths.srcCss)
        .pipe(concat(paths.bundleCss))
        .pipe(cssnano())
        .pipe(gulp.dest(paths.distCss))
});


gulp.task('build', function () {
    process.env.NODE_ENV = 'production';
    runSequence('clean', ['browserify', 'styles']);
});


gulp.task('default', ['clean', 'js', 'css']);

gulp.task('watch', ['clean', 'debug', 'watchjs', 'watchcss']);

